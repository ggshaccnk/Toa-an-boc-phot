import { AccusationPrompt } from '@/types/party';

export const ACCUSATION_PROMPTS: AccusationPrompt[] = [
  {
    id: 'p-1',
    category: 'Vấn Nạn Vay Mượn',
    title: 'Thánh Mất Trí Nhớ Khi Trả Tiền',
    scenario: 'Ai là người có khả năng vay 50k - 100k mua trà sữa rồi sau đó giả vờ mất trí nhớ tạm thời như phim Hàn Quốc?',
    dramaticTag: 'Tội Danh: Quỵt Nợ Công Khai',
    penalties: [
      'Tự nguyện chuyển khoản 10k cho người bên phải ghi nội dung "Tiền chuộc lỗi"',
      'Chụp màn hình số dư tài khoản ngân hàng (che số lại) khoe độ nghèo',
      'Đọc to cam kết: "Từ nay tôi thề trả nợ trước khi người ta mở miệng đòi!"'
    ]
  },
  {
    id: 'p-2',
    category: 'Cao Thủ Giờ Cao Su',
    title: 'Đang Dắt Xe (Nhưng Mới Tỉnh Ngủ)',
    scenario: 'Ai là người nhắn tin: "Tao đang dắt xe ra ngõ rồi nha!" nhưng thực chất vừa mở mắt, mắt nhắm mắt mở với tay lấy bàn chải?',
    dramaticTag: 'Tội Danh: Gian Lận Không Gian & Thời Gian',
    penalties: [
      'Gửi một bức ảnh selfie mặt mộc ngái ngủ nhất vào nhóm chung',
      'Phải vừa nhảy lò cò vừa lặp lại 5 lần: "Tôi là kẻ cao su vô địch thiên hạ!"',
      'Hẹn giờ báo thức sáng mai lúc 5:30 sáng và chụp ảnh làm bằng chứng'
    ]
  },
  {
    id: 'p-3',
    category: 'Sát Thủ Nồi Lẩu',
    title: 'Cú Chộp Thịt Bò Thần Sầu',
    scenario: 'Ai là người luôn rình miếng ba chỉ bò Mỹ cuối cùng trong nồi lẩu, vờ nói chuyện làm phân tâm cả bàn rồi gắp sạch?',
    dramaticTag: 'Tội Danh: Tác Chiến Du Kích Ẩm Thực',
    penalties: [
      'Mô tả lại hương vị của miếng thịt bò tưởng tượng với vẻ mặt xúc động rơi nước mắt',
      'Bị cấm gắp đồ ăn đầu tiên trong bữa tiệc tiếp theo của nhóm',
      'Hát một đoạn nhạc phim kiếm hiệp cổ trang bằng giọng thì thầm'
    ]
  },
  {
    id: 'p-4',
    category: 'Bệnh Nghiện Mua Sắm',
    title: 'Nô Lệ Của Thuật Toán Sàn S',
    scenario: 'Ai là người miệng luôn than hết tiền nhưng ngày nào shipper cũng gọi cửa giao 3 gói hàng chứa đồ vô dụng?',
    dramaticTag: 'Tội Danh: Cúng Tiền Cho Sàn Thương Mại',
    penalties: [
      'Khai báo món đồ vô dụng nhất từng mua trong vòng 3 tháng qua',
      'Đọc to 3 câu đánh giá sản phẩm 5 sao ngớ ngẩn nhất từng viết',
      'Làm động tác người giao hàng bấm chuông "Kính coong, có đơn 0 đồng đây!"'
    ]
  },
  {
    id: 'p-5',
    category: 'Tận Thế Zombie',
    title: 'Kẻ Sống Sót Nhờ Lười Biếng',
    scenario: 'Khi đại dịch Zombie bùng nổ, ai sẽ sống sót đến cuối cùng đơn giản vì quá lười ra khỏi phòng để bị cắn?',
    dramaticTag: 'Tội Danh: Miễn Dịch Nhờ Tự Kỷ Lười',
    penalties: [
      'Bắt chước dáng đi của một con Zombie bị thoát vị đĩa đệm trong 15 giây',
      'Tiết lộ số ngày kỷ lục từng nằm liên tục trên giường không bước chân ra ngoài',
      'Gửi một tin nhắn "Tôi là Zombie xin lỗi bạn" đến người cuối cùng nhắn tin trên Zalo'
    ]
  },
  {
    id: 'p-6',
    category: 'Giao Tiếp Hiện Đại',
    title: 'Chúa Tể Seen Không Rep',
    scenario: 'Ai là người có thói quen đọc tin nhắn từ thông báo màn hình khóa, lờ đi rồi 2 tuần sau rep: "Ủa quên mất hihi"?',
    dramaticTag: 'Tội Danh: Lơ Tin Nhắn Có Hệ Thống',
    penalties: [
      'Mở tin nhắn người gần nhất đang chờ rep và trả lời ngay lập tức bằng một bài thơ',
      'Tự đặt biệt danh trên nhóm chat là "Tổng Đài Bận Máy"',
      'Đọc 10 chữ cuối cùng trong tin nhắn nháp chưa gửi của mình'
    ]
  },
  {
    id: 'p-7',
    category: 'Tập Luyện & Sức Khỏe',
    title: 'Thánh Mua Thẻ Gym Làm Từ Thiện',
    scenario: 'Ai đóng tiền thẻ tập Gym 1 năm nhưng chỉ đi đúng 2 buổi đầu chụp 800 tấm ảnh sống ảo rồi thôi?',
    dramaticTag: 'Tội Danh: Ủng Hộ Phòng Gym Vô Điều Kiện',
    penalties: [
      'Tập hít đất hoặc squat 5 cái ngay lập tức trước mặt mọi người',
      'Tự show tấm ảnh "sống ảo cơ bắp" giả trân nhất trong điện thoại',
      'Đọc to cam kết: "Từ ngày mai tôi sẽ uống nước lọc thay trà sữa trân châu đường đen!"'
    ]
  },
  {
    id: 'p-8',
    category: 'Đời Sống Tình Cảm',
    title: 'Chuyên Gia Tình Yêu... Độc Thân',
    scenario: 'Ai luôn là người tư vấn tình cảm dài 8 trang A4 cho đứa bạn nhưng bản thân thì độc thân trường kỳ từ thuở lọt lòng?',
    dramaticTag: 'Tội Danh: Lý Thuyết Gia Bất Đắc Dĩ',
    penalties: [
      'Cho cả phòng một lời khuyên tình yêu ngớ ngẩn nhất có thể nghĩ ra',
      'Bày tỏ tình cảm say đắm với cái quạt máy hoặc màn hình máy tính',
      'Tự chấm điểm độ lươn lẹo trong tình trường của bản thân trên thang điểm 10'
    ]
  },
  {
    id: 'p-9',
    category: 'Cú Đêm Mạng Xã Hội',
    title: 'Cú Vọ 3 Giờ Sáng',
    scenario: 'Ai là người lướt TikTok/Reels đến 3h30 sáng xem thợ Ấn Độ xây hồ bơi bùn, rồi 7h sáng đi làm than "đời bất công"?',
    dramaticTag: 'Tội Danh: Hủy Hoại Nhịp Sinh Học',
    penalties: [
      'Kể lại video kỳ quặc nhất từng xem lúc nửa đêm',
      'Làm tiếng ngáy ngủ hài hước trong 5 giây',
      'Tự vỗ trán 3 cái và nói: "Tôi hứa tối nay ngủ trước 11 giờ (nói điêu mất lộc)"'
    ]
  },
  {
    id: 'p-10',
    category: 'Bí Kíp Sống Ảo',
    title: 'Kẻ Trộm Áo Của Bạn Bè',
    scenario: 'Ai là người qua nhà bạn chơi thử mặc cái áo khoác khen đẹp, xong tiện tay mặc về nhà luôn nửa năm chưa trả?',
    dramaticTag: 'Tội Danh: Chuyển Giao Quyền Sở Hữu Phi Pháp',
    penalties: [
      'Thú nhận món đồ mượn của ai đó lâu nhất hiện vẫn đang nằm ở nhà mình',
      'Khen người bên trái 3 câu thật lòng nhưng bằng giọng cay cú',
      'Gửi lời cảm ơn chân thành đến chiếc áo vô tội đã bị bắt cóc'
    ]
  },
  {
    id: 'p-11',
    category: 'Tài Năng Hát Hò',
    title: 'Ca Sĩ Phòng Tắm Hủy Diệt',
    scenario: 'Ai là người khi vào quán Karaoke thì giành micro hát từ đầu đến cuối bất chấp giai điệu và tone giọng?',
    dramaticTag: 'Tội Danh: Khủng Bố Màng Nhĩ Bạn Bè',
    penalties: [
      'Hát 1 đoạn điệp khúc bài hát trẻ con theo phong cách Rock Metal hoặc cải lương',
      'Nhường quyền chọn bài hát kế tiếp cho người mình ghét nhất trong phòng',
      'Bịt mũi hát lại một bài hit đang thịnh hành'
    ]
  },
  {
    id: 'p-12',
    category: 'Mạng Xã Hội Sống Ảo',
    title: 'Kiểm Duyệt Hình Ảnh Nghiêm Ngặt',
    scenario: 'Ai là người chụp chung 10 người nhưng chỉ cần mặt mình đẹp là bấm đăng bài ngay, bất chấp 9 đứa còn lại đang nhắm mắt há mồm?',
    dramaticTag: 'Tội Danh: Phản Bội Tình Đồng Chí',
    penalties: [
      'Phải đăng ngay 1 tấm ảnh dìm hàng của chính mình lên Story',
      'Tự khen 3 người chơi khác là "thiên thần không góc chết"',
      'Chụp 1 tấm ảnh mặt xấu nhất có thể và gửi vào group'
    ]
  },
  {
    id: 'p-13',
    category: 'Học Hành & Deadline',
    title: 'Chiến Thần Nước Đến Chân Mới Nhảy',
    scenario: 'Ai là người có bài tập hay deadline 2 tuần nhưng đúng 23h55 của ngày cuối cùng mới bắt đầu mở file Word lên gõ tiêu đề?',
    dramaticTag: 'Tội Danh: Khiêu Vũ Trên Bờ Vực Deadline',
    penalties: [
      'Gõ 1 đoạn văn bản bằng mũi gửi vào ô chat',
      'Kể lại lý do bịa đặt hoang đường nhất từng dùng để xin dời deadline',
      'Làm động tác hoảng loạn khi thấy chuông báo nộp bài reo'
    ]
  },
  {
    id: 'p-14',
    category: 'Tài Chính Ẩn Danh',
    title: 'Bậc Thầy Giả Vờ Tìm Ví Tiền',
    scenario: 'Đến lúc nhân viên mang bill thanh toán ra, ai là người luôn mò mẫm túi xách, ba lô lâu nhất chờ ai đó rút thẻ quẹt trước?',
    dramaticTag: 'Tội Danh: Đóng Kịch Chậm Rút Thẻ',
    penalties: [
      'Móc hết mọi thứ trong túi quần ra đếm trước camera',
      'Bao người bị vote ít nhất 1 ly nước vào lần gặp tới',
      'Hô to: "Tôi nghèo nhưng tôi có tấm lòng vàng!"'
    ]
  },
  {
    id: 'p-15',
    category: 'Đam Mê Bói Toán',
    title: 'Tín Đồ Chiêm Tinh & Tarot',
    scenario: 'Ai là người trước khi làm bất cứ việc gì kể cả chọn ăn bún bò hay cơm tấm cũng phải mở trải bài Tarot hoặc xem cung hoàng đạo?',
    dramaticTag: 'Tội Danh: Giao Phó Vận Mệnh Cho Vũ Trụ',
    penalties: [
      'Xem bói chỉ tay dạo cho người bên cạnh với một lời tiên tri vô căn cứ',
      'Tự nhận mình là pháp sư cung Bọ Cạp / Song Ngư / Ma Kết ngơ ngác',
      'Nói chuyện với giọng điệu thầy bói bí hiểm trong vòng 1 phút'
    ]
  },
  {
    id: 'p-16',
    category: 'Hội Những Người Nhẹ Dạ',
    title: 'Mồi Ngon Của Đa Cấp & Khóa Học',
    scenario: 'Ai là người dễ bị dụ nghe mấy buổi hội thảo "Làm giàu không lối thoát" hay mua khóa học 99k phát triển bản thân nhất?',
    dramaticTag: 'Tội Danh: Niềm Tin Ngây Thơ Vô Bến Bờ',
    penalties: [
      'Thuyết trình bán một cây bút bi hoặc cái dép cho cả phòng trong 30 giây',
      'Hô vang khẩu hiệu: "Tôi là triệu phú tiềm năng, năng lượng đỉnh cao!"',
      'Kể một lần nhẹ dạ cả tin suýt bị lừa nhớ đời'
    ]
  },
  {
    id: 'p-17',
    category: 'Kỹ Năng Lái Xe',
    title: 'Tay Đua F1 Phố Đi Bộ',
    scenario: 'Ai là người bật xi nhan trái nhưng rẽ phải, hoặc vừa lái xe máy vừa ngắm mây ngắm trời làm người ngồi sau cầu nguyện suốt đường?',
    dramaticTag: 'Tội Danh: Thử Thách Lòng Can Đảm Của Bạn Bè',
    penalties: [
      'Làm động tác bóp còi xe máy "Bíp bíp dạt ra cho người đẹp đi!"',
      'Thề rằng từ nay đi qua ngã tư sẽ nhìn trước ngó sau đủ 4 phía',
      'Mô tả cảm giác ngồi sau tay lái của chính mình'
    ]
  },
  {
    id: 'p-18',
    category: 'Kịch Bản Bất Ngờ',
    title: 'Tiktoker Ẩn Danh Trong Đêm',
    scenario: 'Ai có nhiều khả năng lén tạo tài khoản TikTok ảo để stalk người yêu cũ 8 tiếng mỗi ngày mà không để lại dấu vết?',
    dramaticTag: 'Tội Danh: Thám Tử Mạng Xã Hội Trái Phép',
    penalties: [
      'Tiết lộ từ khóa tìm kiếm kỳ lạ nhất gần đây trên TikTok hoặc Google',
      'Tự giác bỏ theo dõi một tài khoản vô nghĩa ngay trên máy',
      'Khai thật: Có stalk người yêu cũ trong vòng 1 tháng qua không?'
    ]
  },
  {
    id: 'p-19',
    category: 'Khen Cho Vui',
    title: 'Thánh Nịnh Hót Không Hề Giả Trân',
    scenario: 'Ai là người luôn khen sếp hay đồng nghiệp bằng những từ ngữ hoa mỹ ngút trời dù trong lòng đang chê tơi bời?',
    dramaticTag: 'Tội Danh: Nghệ Sĩ Ngoại Giao Điêu Luyện',
    penalties: [
      'Khen bộ đồ của người ngồi đối diện bằng 5 tính từ mỹ miều nhất',
      'Cười một nụ cười công nghiệp giả trân giữ nguyên trong 10 giây',
      'Nói một câu tự phê bình bản thân thẳng thắn không né tránh'
    ]
  },
  {
    id: 'p-20',
    category: 'Nấu Nướng Thảm Họa',
    title: 'Đầu Bếp Hắc Ám',
    scenario: 'Ai là người luộc trứng làm nổ nồi, nấu mì tôm làm cháy đáy xoong hoặc nêm nhầm muối thay đường?',
    dramaticTag: 'Tội Danh: Đe Dọa An Toàn Gian Bếp',
    penalties: [
      'Kể về món ăn thảm họa nhất từng tự tay chế biến',
      'Tự nhận danh hiệu "Gordon Ramsay phiên bản hủy diệt"',
      'Mô tả cách nấu món trứng chiên nhưng bằng phong cách phim kinh dị'
    ]
  },
  {
    id: 'p-21',
    category: 'Drama & Hóng Hớt',
    title: 'Cái Loa Phường Của Công Ty',
    scenario: 'Ai là người biết mọi bí mật từ việc ai sắp nghỉ việc, ai đang hẹn hò ngầm đến chuyện mèo nhà sếp đẻ mấy con trước cả phòng nhân sự?',
    dramaticTag: 'Tội Danh: Tổng Cục Tình Báo Hóng Hớt',
    penalties: [
      'Tiết lộ một tin đồn thú vị (không gây hại) chưa ai trong phòng biết',
      'Tự vỗ miệng 3 cái: "Biết nhiều khổ nhiều, từ nay bớt hóng!"',
      'Làm động tác nhòm trộm qua khe cửa'
    ]
  },
  {
    id: 'p-22',
    category: 'Trốn Đi Chơi',
    title: 'Chuyên Gia Tự Nhiên Mệt Đột Xuất',
    scenario: 'Ai là người trước giờ hẹn 30 phút hay nhắn tin: "Tự dưng tao hơi nhức đầu / đau bụng, chắc cho tao lỡ hẹn bữa nay nha"?',
    dramaticTag: 'Tội Danh: Hủy Kèo Phút Chót',
    penalties: [
      'Phải cam kết lần sau đi chơi đến sớm trước 15 phút',
      'Bắt chước một lý do thoái thác vụng về nhất trần đời',
      'Gửi lời xin lỗi chân thành đến tất cả các kèo từng bị mình cho leo cây'
    ]
  },
  {
    id: 'p-23',
    category: 'Thói Quen Ngủ Nghê',
    title: 'Báo Động Cấp 10 Khi Dậy Sớm',
    scenario: 'Ai là người đặt 15 cái báo thức từ 6h00 đến 7h30, chuông kêu rung chuyển cả nhà nhưng chỉ có người khác thức còn bản thân vẫn ngủ say?',
    dramaticTag: 'Tội Danh: Đặt Báo Thức Cho Hàng Xóm Nghe',
    penalties: [
      'Giả tiếng chuông báo thức iPhone "Radar" chát chúa trong 5 giây',
      'Mở màn hình danh sách báo thức chụp lại cho cả phòng chiêm ngưỡng',
      'Tự nói vào gương: "Báo thức sinh ra là để dậy, không phải để hoãn!"'
    ]
  },
  {
    id: 'p-24',
    category: 'Thanh Niên Sợ Ma',
    title: 'Dũng Sĩ Sợ Bóng Tối',
    scenario: 'Ai là người tối đi vệ sinh phải chạy thật nhanh về giường trùm mền kín đầu vì sợ có bàn tay thò ra nắm chân?',
    dramaticTag: 'Tội Danh: Trí Tưởng Tượng Quá Phong Phú',
    penalties: [
      'Kể về lần sợ ma ngớ ngẩn nhất trong đời (hóa ra là đống quần áo)',
      'Hét to: "Ma quỷ tránh xa, người vô tội ở đây!"',
      'Làm vẻ mặt giật mình thảng thốt như vừa thấy bóng trắng'
    ]
  },
  {
    id: 'p-25',
    category: 'Chơi Game Thua Cay Cú',
    title: 'Chúa Đổ Thừa Thiết Bị & Mạng Lag',
    scenario: 'Mỗi lần chơi game thua là do: "Chuột bị kẹt", "Ping 999ms", "Đồng đội óc tiêu", chứ tuyệt nhiên không bao giờ do kỹ năng gà?',
    dramaticTag: 'Tội Danh: Đổ Lỗi Cho Nhà Mạng Toàn Cầu',
    penalties: [
      'Thừa nhận công khai: "Tôi chơi dở thật sự chứ mạng FPT vô tội!"',
      'Làm động tác đập bàn phím kiểu gamer mất bình tĩnh',
      'Khen ngợi kỹ năng của người chơi giỏi nhất phòng 1 câu thật lòng'
    ]
  }
];
