export interface User {
  id?: string;
  branches?: { name: string; id: string }[];
  email?: string;
  company?: string;
  name?: string;
  thumb?: string;
  image?: string;
  imageRef?: string;
  phone?: string;
  role?: string;
  permissions?: any[];
  permissionsList?: string[];
  needsSetup?: boolean;
  title?: string;
}
