export interface QnA {
  q: string
  a: string
}

export interface Topic {
  topic_id: string
  title: string
  difficulty: string
  estimated_time: string
  prerequisites: string[]
  learning_outcomes: string[]
  content: string
  examples: string[]
  common_mistakes: string[]
  qna: QnA[]
}

export interface DetailedModule {
  module_id: string
  title: string
  topics: Topic[]
}

export interface DetailedSubject {
  subject_id: string
  title: string
  modules: DetailedModule[]
}

export interface SyllabusModule {
  id: string
  title: string
}

export interface Course {
  id: string
  title: string
  icon: string
  modules: SyllabusModule[]
  tag?: string
}

// export interface QnA {
//   q: string
//   a: string
// }

// export interface Topic {
//   topic_id: string
//   title: string
//   difficulty: "easy" | "medium" | "hard"
//   estimated_time: string
//   prerequisites: string[]
//   learning_outcomes: string[]
//   content: string
//   examples: string[]
//   common_mistakes: string[]
//   qna: QnA[]
// }

// export interface Module {
//   module_id: string
//   title: string
//   topics: Topic[]
// }

// export interface Course {
//   subject_id: string
//   title: string
//   icon: string
//   modules: Module[]
//   tag?: string
//   version?: string
// }

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}
