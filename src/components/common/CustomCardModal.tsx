'use client';

import React, { useState } from 'react';
import { AlibiCard } from '@/types/party';
import { PaperCard } from '@/components/common/PaperCard';
import { ALIBI_RANDOM_INSPIRATIONS } from '@/data/cards';
import { partyAudio } from '@/lib/partyAudio';
import {
  DoodlePen,
  DoodleDice,
  WashiTape,
  RubberStamp,
} from '@/components/common/HandDoodles';

interface CustomCardModalProps {
  playerName: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateCard: (card: AlibiCard) => void;
}

const ICON_CHOICES = [
  { id: 'mirror', label: 'Gương soi' },
  { id: 'bomb', label: 'Quả bom' },
  { id: 'dog', label: 'Cún cưng' },
  { id: 'dice', label: 'Xí ngầu' },
  { id: 'laptop', label: 'Máy tính' },
  { id: 'pointing', label: 'Chỉ tay' },
  { id: 'masks', label: 'Đa nhân cách' },
  { id: 'shield', label: 'Khiên hộ mệnh' },
  { id: 'heart', label: 'Trái tim' },
  { id: 'burger', label: 'Bánh burger' },
];

export const CustomCardModal: React.FC<CustomCardModalProps> = ({
  playerName,
  isOpen,
  onClose,
  onCreateCard,
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('mirror');

  if (!isOpen) return null;

  const handleRandomize = () => {
    partyAudio.playCardHover();
    const randomItem =
      ALIBI_RANDOM_INSPIRATIONS[
        Math.floor(Math.random() * ALIBI_RANDOM_INSPIRATIONS.length)
      ];
    setTitle(randomItem.title);
    setTagline(randomItem.tagline);
    setDescription(randomItem.description);
  };

  const previewCard: AlibiCard = {
    id: `custom-${Date.now()}`,
    title: title.trim() || 'TÔI HOÀN TOÀN VÔ TỘI',
    tagline: tagline.trim() || 'Thề có bóng đèn tôi vô tri!',
    description:
      description.trim() ||
      'Hãy nhìn vào đôi mắt chân thật này, làm sao một người đáng yêu như tôi lại làm chuyện đó được chứ?',
    category: 'custom',
    color: '#FFB800',
    badgeText: 'TỰ CHẾ ĐỘC QUYỀN ✍️',
    illustration: icon,
    authorName: playerName,
  };

  const handleConfirm = () => {
    if (!title.trim() && !description.trim()) {
      handleRandomize();
    }
    partyAudio.playCardPlay();
    onCreateCard(previewCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border-[3px] border-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-pop-lg space-y-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 border-2 border-slate-900 rounded-xl shadow-pop-sm flex items-center justify-center shrink-0">
              <DoodlePen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-slate-900 uppercase font-display">
                XƯỞNG TỰ CHẾ LỜI BÀO CHỮA BẤT HỦ ⚖️
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Tự tay tạo lá bài Risograph mang chữ ký và lý do cãi cùn của bạn!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 hover:bg-slate-100 border-2 border-slate-900 rounded-xl font-black text-xs uppercase"
          >
            ĐÓNG [ ✕ ]
          </button>
        </div>

        {/* 2-Column: Form inputs on left, Live Card Preview on right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Inputs (7 cols) */}
          <div className="md:col-span-7 space-y-3.5">
            {/* Random Inspiration Button */}
            <button
              type="button"
              onClick={handleRandomize}
              className="w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 border-2 border-slate-900 rounded-xl font-black text-xs uppercase text-amber-950 flex items-center justify-center gap-2 shadow-pop-sm transition-transform active:translate-y-0.5"
            >
              <DoodleDice className="w-5 h-5 shrink-0" />
              <span>BÍ TỪ? BẤM ĐÂY GỢI Ý CÙN NGAY!</span>
            </button>

            {/* Title */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                Tiêu Đề Bào Chữa (Ngắn gọn, giật gân):
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={35}
                placeholder="VD: DO BÀ NGOẠI DẶN KHÔNG ĐƯỢC NHẬN TỘI..."
                className="w-full px-3 py-2 text-xs md:text-sm font-bold bg-paper-cream border-2 border-slate-900 rounded-xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                Câu Khẩu Hiệu Kêu Oan (Để trong ngoặc kép):
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                maxLength={45}
                placeholder="VD: Thề có bóng đèn tôi hoàn toàn trong sạch!"
                className="w-full px-3 py-2 text-xs md:text-sm font-semibold bg-paper-cream border-2 border-slate-900 rounded-xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                Lý Do &amp; Luận Điểm Cãi Cùn:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={120}
                placeholder="Trình bày lý lẽ vì sao bạn vô tội và người khác mới là thủ phạm..."
                className="w-full px-3 py-2 text-xs md:text-sm font-medium bg-paper-cream border-2 border-slate-900 rounded-xl shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              />
            </div>

            {/* Icon selection */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                Chọn Hình Vẽ Minh Họa:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ICON_CHOICES.map((ic) => (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setIcon(ic.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-900 transition-all ${
                      icon === ic.id
                        ? 'bg-yellow-300 font-black shadow-pop-sm scale-105'
                        : 'bg-white hover:bg-slate-100'
                    }`}
                  >
                    [ {ic.label} ]
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-paper-cream border-2 border-slate-900 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-slate-500 mb-2">
              XEM TRƯỚC BẢN IN THẺ BÀI
            </span>
            <PaperCard card={previewCard} isPlayable={false} />
            <span className="mt-2 text-[10px] font-bold text-slate-600">
              Người soạn thảo: {playerName}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl font-black text-xs uppercase"
          >
            HỦY [ ✕ ]
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 border-2 border-slate-900 rounded-xl font-black text-xs md:text-sm uppercase shadow-pop flex items-center gap-2 transition-transform active:translate-y-0.5"
          >
            <span>[ ĐÓNG DẤU &amp; RA TÒA TRANH TỤNG ⚖️ ]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
