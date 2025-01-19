
// 根据https://api.github.com/repos/Icedb/bbTools 文件判断是否需要更新
const fetchPackageJson = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://api.github.com/repos/Icedb/bbTools/releases/latest', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const packageJson = await response.json();
    return packageJson;
  } catch (error) {
    return null;
  }
}

export async function updateToGithub() {
  const packageJson = await fetchPackageJson();
  if (!packageJson) {
    return false;
  }
  const latestVersion = packageJson.name;
  const currentVersion = __APP_VERSION__
  // 去除v和.，比较版本号
  if (latestVersion.replace(/[v.]/g, '') > currentVersion.replace(/[v.]/g, '')) {
    return {
      version: latestVersion,
      downloadUrl: packageJson.assets[0].browser_download_url,
      body: packageJson.body,
      code: 0
    };
  } else {
    return {
      version: currentVersion,
      downloadUrl: '',
      body: '',
      code: 1
    };
  }
}