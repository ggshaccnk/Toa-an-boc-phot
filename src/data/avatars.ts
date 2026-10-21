export interface AvatarPreset {
  id: string;
  name: string;
  badge: string;
  bgColor: string;
  borderColor: string;
  svgType: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'cat_lawyer',
    name: 'Mèo Luật Sư Ngáo',
    badge: 'Cãi Cùn Số 1',
    bgColor: '#FEF08A',
    borderColor: '#EAB308',
    svgType: 'cat'
  },
  {
    id: 'shiba_sweat',
    name: 'Shiba Toát Mồ Hôi',
    badge: 'Mặt Giả Trân',
    bgColor: '#FED7AA',
    borderColor: '#F97316',
    svgType: 'shiba'
  },
  {
    id: 'frog_smug',
    name: 'Ếch Âm Mưu',
    badge: 'Chúa Tể Lật Kèo',
    bgColor: '#BBF7D0',
    borderColor: '#22C55E',
    svgType: 'frog'
  },
  {
    id: 'duck_detective',
    name: 'Vịt Thám Tử',
    badge: 'Chỉ Tay Dạo',
    bgColor: '#BAE6FD',
    borderColor: '#0284C7',
    svgType: 'duck'
  },
  {
    id: 'sloth_pillow',
    name: 'Lười Trùm Chăn',
    badge: 'Đang Ngủ Vô Tội',
    bgColor: '#DDD6FE',
    borderColor: '#8B5CF6',
    svgType: 'sloth'
  },
  {
    id: 'dino_shock',
    name: 'Khủng Long Ngơ Ngác',
    badge: 'Nạn Nhân Thường Trực',
    bgColor: '#FECDD3',
    borderColor: '#F43F5E',
    svgType: 'dino'
  },
  {
    id: 'bear_judge',
    name: 'Gấu Thẩm Phán Cọc Cằn',
    badge: 'Gõ Búa Liên Tục',
    bgColor: '#FDE68A',
    borderColor: '#D97706',
    svgType: 'bear'
  },
  {
    id: 'alien_nerd',
    name: 'Người Hành Tinh Khác',
    badge: 'Mất Tín Hiệu Trái Đất',
    bgColor: '#A7F3D0',
    borderColor: '#059669',
    svgType: 'alien'
  }
];

export const BOT_NAMES = [
  { name: 'Bảo Bào Chữa', avatar: 'cat_lawyer' },
  { name: 'Linh Lươn Lẹo', avatar: 'frog_smug' },
  { name: 'Tuấn Tội Nghiệp', avatar: 'dino_shock' },
  { name: 'Hà Hóng Hớt', avatar: 'duck_detective' },
  { name: 'Khánh Kêu Oan', avatar: 'shiba_sweat' },
  { name: 'Mai Mê Ngủ', avatar: 'sloth_pillow' },
];
