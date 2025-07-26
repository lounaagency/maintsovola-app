export interface NavItem {
  name: string;
  type: 'text' | 'icon' | 'profile';
  id: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isNew: boolean;
  route?: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isNew: boolean;
}

export interface NavbarProps {
  activeNavIcon?: string;
  onNavChange?: (navId: string) => void;
}

