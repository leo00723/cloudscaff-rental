export interface Chapter {
  videos: Video[];
  chapter: string;
  time: string;
}
export interface Video {
  id: string;
  title: string;
  time: string;
}
