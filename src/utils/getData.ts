// import { getBB } from '@/api/push';

const getBB = (query: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    // 使用 once 而不是 on，避免多次触发
    try {
      const result = window.ipcRenderer.sendSync('getBBData', query)
      console.log('getBBData-result', result)
      resolve(result)
    } catch (error) {
      console.log('getBBData-error', error)
      reject(error)
    }
  })
}

interface PostData {
  uid: number;
  server: string;
}

export interface PeopleData {
  uid: number;
  name: string;
  retcode?: number;
  profile?: any;
  message?: string;
}

export interface GroupData {
  server: string;
  userObj: {
    [key: string]: {
      group: PeopleData[];
    };
  };
}



export async function getUserSingleData(postData: PostData): Promise<PeopleData> {
  const query = {
    role_id: postData.uid,
    server: postData.server
  };
  return getBB(query);
}

