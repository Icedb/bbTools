// ========== interface 定义 ==========
export interface HistoryItem {
  level_id: number
  enter_time: number
  pass_time: number
  contribute_rate: number
}

export interface BattleInfo {
  map_figure_url?: string
  map_name?: string
  status?: number | string
  name1?: string
  name2?: string
  history: HistoryItem[]
}

export interface LevelInfo {
  map_figure_url?: string
  map_name?: string
  history: HistoryItem[]
}

export interface PeopleData {
  name: string
  uid: number
  message?: string
  profile: {
    battle_info: {
      history: BattleInfo[]
    },
    name: string,
    level_info: LevelInfo
  }
}

export interface GroupItem {
  groupName: string
  group: PeopleData[]
}

export interface ChartOptionItem {
  name: string
  desc: string
}

export interface HistoryArrItem {
  label: string
  value: number
}
