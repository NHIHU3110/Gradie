require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

async function seedExtra() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI in .env');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB.');
    const db = client.db();

    // ── EXTRA BLOG POSTS ──────────────────────────────────────────────────────
    const blogCol = db.collection('blogPosts');
    const extraBlogs = [
      {
        id: 'b4',
        title: '7 Ý Tưởng Chụp Ảnh Kỷ Yếu Không Thể Bỏ Qua Năm 2026',
        category: 'Photoshoot Concepts',
        status: 'Published',
        date: '2026-05-28',
        author: 'Gradie Team',
        excerpt: 'Từ concept rực rỡ ngoài trời cho đến studio sang trọng, chúng tôi tổng hợp 7 ý tưởng chụp ảnh kỷ yếu hot nhất năm nay.',
        content: 'Mùa tốt nghiệp đang đến gần! Đây là thời điểm để ghi lại những kỷ niệm đẹp nhất. Bài viết này tổng hợp 7 concept chụp ảnh kỷ yếu đang cực kỳ hot trong cộng đồng sinh viên năm 2026. Từ không gian ngoài trời chan hòa ánh sáng tự nhiên, đến studio với backdrop rực rỡ hay phong cách vintage hoài cổ - mỗi concept đều mang một câu chuyện riêng, giúp bạn lưu giữ trọn vẹn khoảnh khắc đáng nhớ này.',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
        tags: ['Kỷ yếu', 'Photoshoot', 'Tốt nghiệp', '2026']
      },
      {
        id: 'b5',
        title: 'Cách Chọn Quà Tặng Tốt Nghiệp Phù Hợp Với Từng Ngân Sách',
        category: 'Gifting Tips',
        status: 'Published',
        date: '2026-05-25',
        author: 'Gradie Team',
        excerpt: 'Không cần chi nhiều tiền vẫn có thể tặng món quà ý nghĩa. Bài viết này hướng dẫn bạn chọn quà thông minh từ dưới 200k đến trên 1 triệu.',
        content: 'Chọn quà tốt nghiệp không nhất thiết phải tốn kém. Điều quan trọng nhất chính là sự chân thành và tâm ý bạn gửi gắm vào món quà đó. Dưới đây là gợi ý chi tiết theo từng mức ngân sách:\n\n**Dưới 200.000đ:** Hoa tươi handmade, thiệp chúc mừng cá nhân hóa, bookmark sách nghệ thuật.\n\n**200.000đ - 500.000đ:** Gấu bông khắc tên, khung ảnh khắc laser, bình nước giữ nhiệt in logo.\n\n**Trên 500.000đ:** Bộ quà tặng luxury, sash thêu chỉ vàng, hộp quà handmade cao cấp.',
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
        tags: ['Chọn Quà', 'Ngân Sách', 'Tốt nghiệp', 'Tips']
      },
      {
        id: 'b6',
        title: 'Nghệ Thuật Thêu Chỉ Vàng: Từ Truyền Thống Đến Hiện Đại',
        category: 'Behind the Scenes',
        status: 'Published',
        date: '2026-05-22',
        author: 'Aurora Howard',
        excerpt: 'Khám phá hành trình kỳ diệu của từng mũi chỉ vàng óng ánh trên dải lụa Sash - nghề thủ công tinh tế đã tồn tại hàng thế kỷ.',
        content: 'Thêu chỉ vàng là một nghệ thuật thủ công tinh tế đòi hỏi sự kiên nhẫn và khéo léo. Tại Gradie, mỗi sản phẩm thêu tay đều là tác phẩm nghệ thuật độc nhất vô nhị. Chúng tôi sử dụng chỉ metallic cao cấp nhập khẩu, kết hợp với kỹ thuật thêu tay truyền thống và máy thêu vi tính hiện đại để tạo ra những đường nét tinh xảo nhất.',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
        tags: ['Thêu', 'Handcraft', 'Sash', 'Artisan']
      },
      {
        id: 'b7',
        title: 'Top 10 Lời Chúc Tốt Nghiệp Hay Và Ý Nghĩa Nhất 2026',
        category: 'Gifting Tips',
        status: 'Published',
        date: '2026-05-20',
        author: 'Gradie Team',
        excerpt: 'Lời chúc chân thành luôn là phần cảm xúc nhất của một món quà. Tổng hợp những lời chúc hay và độc đáo giúp bạn chạm đến trái tim người nhận.',
        content: 'Một tấm thiệp với lời chúc chân thành đôi khi còn quý giá hơn cả món quà đắt tiền. Dưới đây là 10 lời chúc tốt nghiệp hay nhất mà Gradie tổng hợp từ hàng nghìn đơn hàng của chúng tôi:\n\n1. "Chúc mừng tốt nghiệp! Đây là bước đệm đầu tiên cho những ước mơ tuyệt vời phía trước."\n2. "Bốn năm đèn sách đã được đền đáp xứng đáng. Hãy tỏa sáng như chính con người bạn nhé!"\n3. "Hôm nay bạn đóng lại một cuốn sách, ngày mai bạn mở ra một chương mới tươi sáng hơn."\n4. "Chúc mừng! Cái học khó nhọc hôm nay sẽ là nền tảng vững chắc cho tương lai rực rỡ."\n5. "Bạn đã chinh phục được ngọn núi đầu tiên, và phía trước còn nhiều đỉnh cao đẹp hơn đang chờ!"',
        image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
        tags: ['Lời Chúc', 'Tốt Nghiệp', 'Thiệp', 'Cảm xúc']
      },
      {
        id: 'b8',
        title: 'Bình Giữ Nhiệt Khắc Tên: Món Quà Thực Dụng Cho Tân Cử Nhân',
        category: 'Product Spotlight',
        status: 'Published',
        date: '2026-05-18',
        author: 'Gradie Team',
        excerpt: 'Món quà vừa đẹp, vừa dùng được mỗi ngày - đó chính là bình giữ nhiệt khắc tên. Tìm hiểu tại sao nó trở thành best seller của Gradie.',
        content: 'Trong thế giới quà tặng tốt nghiệp đa dạng, bình giữ nhiệt khắc tên nổi bật nhờ sự kết hợp hoàn hảo giữa tính thực dụng và ý nghĩa cá nhân. Mỗi lần người nhận dùng bình này để uống trà buổi sáng hay cà phê chiều tối, họ sẽ nhớ đến khoảnh khắc đặc biệt và người tặng quà. Chất liệu thép không gỉ 304 cao cấp, lớp sơn tĩnh điện bền màu, khắc laser sắc nét - đây thực sự là món quà để đời.',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
        tags: ['Bình Nước', 'Khắc Tên', 'Quà Thực Dụng', 'Best Seller']
      },
      {
        id: 'b9',
        title: 'Hoa Tươi Mừng Tốt Nghiệp: Ý Nghĩa Của Từng Loại Hoa',
        category: 'Meaning of Gifts',
        status: 'Published',
        date: '2026-05-15',
        author: 'Gradie Team',
        excerpt: 'Mỗi loại hoa mang một thông điệp riêng. Hãy chọn đúng loại hoa để gửi trọn ý nghĩa yêu thương đến người nhận trong ngày trọng đại.',
        content: 'Hoa tươi là ngôn ngữ của tình cảm. Trong ngày tốt nghiệp đặc biệt, mỗi loài hoa đều mang thông điệp riêng:\n\n**Hoa Hướng Dương:** Tượng trưng cho niềm vui, sự lạc quan và ánh sáng tương lai. Phù hợp nhất cho ngày tốt nghiệp.\n\n**Hoa Hồng Champagne:** Biểu tượng của thành công cao quý và lời chúc mừng trân trọng từ đáy lòng.\n\n**Hoa Cúc Trắng:** Thuần khiết, trong sáng - tượng trưng cho chặng đường mới tinh khôi phía trước.\n\n**Hoa Baby\'s Breath:** Những ước mơ nhỏ bé kết thành những thành công vĩ đại.',
        image: 'https://images.unsplash.com/photo-1490750967868-88df5691166a?w=800&q=80',
        tags: ['Hoa', 'Ý Nghĩa', 'Tốt Nghiệp', 'Ngôn Ngữ Hoa']
      }
    ];

    // Chỉ thêm các bài chưa tồn tại (upsert by id)
    for (const post of extraBlogs) {
      await blogCol.updateOne({ id: post.id }, { $setOnInsert: post }, { upsert: true });
    }
    console.log(`Upserted ${extraBlogs.length} extra blog posts.`);

    // ── EXTRA GALLERY ITEMS ───────────────────────────────────────────────────
    const galleryCol = db.collection('gallery');
    const extraGallery = [
      { id: 'g4',  type: 'Customer Photo',     title: 'Khoảnh Khắc Nhận Bằng',          status: 'Published', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80' },
      { id: 'g5',  type: 'Photoshoot Concept', title: 'Golden Hour Graduation',           status: 'Published', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80' },
      { id: 'g6',  type: 'Product Showcase',   title: 'Sash Thêu Chỉ Vàng Cao Cấp',      status: 'Published', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80' },
      { id: 'g7',  type: 'Customer Photo',     title: 'Gia Đình Hạnh Phúc Ngày Tốt Nghiệp', status: 'Published', image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80' },
      { id: 'g8',  type: 'Product Showcase',   title: 'Hộp Quà Luxury Ribbon',            status: 'Published', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80' },
      { id: 'g9',  type: 'Photoshoot Concept', title: 'Concept Studio Ánh Vàng',          status: 'Published', image: 'https://images.unsplash.com/photo-1490750967868-88df5691166a?w=600&q=80' },
      { id: 'g10', type: 'Customer Photo',     title: 'Nụ Cười Ngày Tốt Nghiệp',         status: 'Published', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80' },
      { id: 'g11', type: 'Product Showcase',   title: 'Bình Nước Khắc Tên Tinh Xảo',     status: 'Published', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80' },
      { id: 'g12', type: 'Photoshoot Concept', title: 'Concept Hoa Hướng Dương',          status: 'Published', image: 'https://images.unsplash.com/photo-1444985861101-8e5903e9a895?w=600&q=80' },
      { id: 'g13', type: 'Customer Photo',     title: 'Kỷ Yếu Cùng Bạn Thân',            status: 'Published', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' }
    ];

    for (const item of extraGallery) {
      await galleryCol.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true });
    }
    console.log(`Upserted ${extraGallery.length} extra gallery items.`);

    console.log('Extra data seeded successfully!');
  } catch (err) {
    console.error('Error seeding extra data:', err);
  } finally {
    await client.close();
  }
}

seedExtra();
