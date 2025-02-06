// import { getBB } from '@/api/push';

const getBB = (query: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cookie = window.localStorage.getItem('cookie');
    
    // 生成一个唯一的消息ID
    const messageId = `getBBData-${Math.random()}-${Date.now()}`;

    // 监听主进程的响应
    window.ipcRenderer.once(messageId, (event, result) => {
      if (result.error) {
        reject(result.error);
      } else {
        resolve(result.data);
      }
    });

    // 发送消息到主进程
    window.ipcRenderer.send('getBBData', messageId, query, cookie);
  });
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

