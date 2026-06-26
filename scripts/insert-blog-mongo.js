require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI is not set in environment variables or .env');
  process.exit(1);
}

const newPosts = [
  {
    id: "b5",
    title: "Bộ Sưu Tập Quà Tặng Tốt Nghiệp Cao Cấp Bán Chạy Nhất Tại Gradie Mùa Lễ 2026",
    excerpt: "Khám phá những món quà tốt nghiệp độc đáo, ý nghĩa và được thiết kế cá nhân hóa tinh tế nhất từ Gradie để ghi dấu ngày trọng đại của người thương yêu.",
    content: "<p>Lễ tốt nghiệp là cột mốc thiêng liêng đánh dấu sự trưởng thành, khép lại hành trình học tập nỗ lực và mở ra cánh cổng tương lai tươi sáng. Để giúp bạn gửi gắm trọn vẹn tình cảm và sự tự hào đến những tân cử nhân trong ngày đặc biệt này, Gradie mang đến bộ sưu tập quà tặng tốt nghiệp độc đáo, cao cấp và đầy ý nghĩa. Hãy cùng điểm qua bốn món quà tặng đang dẫn đầu xu hướng và được yêu thích nhất tại Gradie trong mùa lễ tốt nghiệp năm nay.</p>\n\n<p>Đầu tiên phải kể đến dòng sản phẩm quà cá nhân hóa tinh tế, nơi mỗi món quà là một tác phẩm độc nhất vô nhị dành riêng cho người nhận. Nổi bật trong dòng sản phẩm này là những chiếc túi vải cao cấp thêu tên thủ công tỉ mỉ với họa tiết hoa nhã nhặn trên nền vải mịn màng. Với mức giá chỉ từ 199.000đ, món quà thêu tên cá nhân không chỉ mang giá trị sử dụng cao nhưng còn thể hiện sự tinh tế của người tặng, khẳng định rằng người nhận là duy nhất và món quà dành cho họ cũng độc đáo không ai giống ai.</p>\n<img src=\"images/blog_personalized_gift.jpg\" alt=\"Quà Cá Nhân Hóa Gradie\" style=\"width:100%; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">\n\n<p>Bên cạnh những món quà cá nhân hóa thêu tên, bó hoa len tốt nghiệp thủ công cũng là sự lựa chọn hoàn hảo được đông đảo khách hàng săn đón. Nếu như những đóa hoa tươi chỉ lưu giữ được vẻ đẹp trong khoảnh khắc ngắn ngủi, thì đóa hoa len được móc tay tỉ mỉ từ những sợi len mềm mại sẽ lưu giữ trọn vẹn ký ức của ngày ra trường mãi về sau. Mỗi bó hoa len tốt nghiệp tại Gradie có giá chỉ từ 149.000đ, được phối màu pastel nhẹ nhàng sang trọng, đi kèm thiệp chúc mừng thiết kế tinh xảo và đóng gói vô cùng chỉn chu. Đây thực sự là món quà bền vững theo thời gian, gửi gắm thông điệp chân thành rằng tình cảm chân thành sẽ không bao giờ nhạt phai.</p>\n<img src=\"images/blog_crochet_flowers.jpg\" alt=\"Bó Hoa Len Tốt Nghiệp Gradie\" style=\"width:100%; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">\n\n<p>Một biểu tượng không thể thiếu trong ngày lễ nhận bằng chính là những chú gấu bông tốt nghiệp đáng yêu. Chú gấu bông cử nhân của Gradie được chế tác từ chất liệu lông mềm mịn cao cấp, khoác lên mình bộ lễ phục cử nhân thắt nơ lịch lãm và tay cầm bó hoa len mini xinh xắn. Với mức giá từ 189.000đ, chú gấu bông nhỏ nhắn này sẽ là người bạn đồng hành ấm áp để ôm khi vui, để nhớ khi buồn, và để nhắc nhở các tân cử nhân về ngày họ đã tỏa sáng rực rỡ dưới mái trường thân yêu. Hộp quà tặng đi kèm gấu bông được thiết kế tinh tế giúp bạn dễ dàng trao gửi lời chúc tự hào đến người thương yêu một cách trang trọng nhất.</p>\n<img src=\"images/blog_graduation_teddy.jpg\" alt=\"Gấu Bông Tốt Nghiệp Gradie\" style=\"width:100%; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">\n\n<p>Cuối cùng, nếu bạn muốn món quà của mình trở nên thật nổi bật và lung linh giữa hàng trăm bức ảnh kỷ niệm, hoa bóng bay tốt nghiệp chính là sự lựa chọn đột phá nhất. Sản phẩm là sự kết hợp độc đáo giữa chú gấu bông cử nhân đáng yêu đặt bên trong quả bóng bay trong suốt cỡ lớn in chữ chúc mừng nổi bật, xung quanh là những đóa hồng tươi tắn và bóng bay pastel đồng điệu. Với mức giá từ 359.000đ, mẫu hoa bóng bay này mang thiết kế vô cùng sang trọng và bắt mắt, chắc chắn sẽ giúp người thương yêu của bạn chiếm trọn mọi ánh nhìn và tạo nên những bức ảnh kỷ yếu độc đáo, biến ngày lễ tốt nghiệp trở thành một ký ức lộng lẫy khó quên.</p>\n<img src=\"images/blog_graduation_balloon.jpg\" alt=\"Hoa Bóng Bay Tốt Nghiệp Gradie\" style=\"width:100%; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">\n\n<p>Với bộ sưu tập đa dạng từ túi cá nhân hóa thêu tên, bó hoa len lưu niệm, gấu bông cử nhân đến hoa bóng bay sang trọng, Gradie cam kết mang lại sự hài lòng tuyệt đối nhờ vào quy trình đóng gói chỉn chu, tỉ mỉ và giao hàng nhanh chóng. Hãy ghé cửa hàng Gradie hoặc liên hệ trực tuyến ngay hôm nay để chọn lựa những món quà tốt nghiệp đong đầy tình cảm nhất cho những người thân yêu của bạn!</p>",
    "image": "images/blog_personalized_gift.jpg",
    "date": "26/06/2026",
    "author": "Gradie",
    "category": "Gợi ý Quà Tặng",
    "status": "Published"
  },
  {
    "id": "b6",
    "title": "Checklist Tốt Nghiệp: Lưu Ngay Kẻo Đến Ngày Lại Quên!",
    "excerpt": "Ngày tốt nghiệp cận kề với bao nhiêu việc phải lo toan? Hãy lưu ngay checklist chuẩn bị chi tiết từ Gradie dưới đây để có một ngày nhận bằng trọn vẹn và không lo thiếu sót nhé!",
    "content": "<p>Ngày lễ nhận bằng tốt nghiệp là một trong những cột mốc trọng đại nhất của thời sinh viên. Để ngày vui này diễn ra trọn vẹn và hoàn hảo nhất, việc chuẩn bị kỹ lưỡng từ trước là vô cùng quan trọng. Hãy cùng Gradie điểm qua checklist những việc cần làm ngay dưới đây để không bỏ sót bất kỳ chi tiết nào trong ngày trọng đại của mình nhé!</p>\n\n<p>Trước hết, hãy chắc chắn rằng bạn đã kiểm tra kỹ thời gian và địa điểm tổ chức lễ tốt nghiệp của trường mình. Hãy nắm rõ khung giờ tập trung, giờ làm lễ chính thức và sơ đồ hội trường để tránh việc đi muộn hoặc lạc đường. Tiếp theo là chuẩn bị sẵn sàng áo tốt nghiệp (áo cử nhân), nón tốt nghiệp và các phụ kiện đi kèm như dải sash hay bằng tốt nghiệp giả để chụp ảnh. Đừng quên lựa chọn trang phục lịch sự và thoải mái để mặc bên trong áo cử nhân, giúp bạn tự tin và nổi bật suốt cả ngày dài.</p>\n<img src=\"images/blog_checklist_tot_nghiep.jpg\" alt=\"Checklist Tốt Nghiệp Gradie\" style=\"width:100%; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">\n\n<p>Bên cạnh trang phục, việc chuẩn bị các thiết bị công nghệ cũng quan trọng không kém. Hãy sạc đầy pin điện thoại, máy ảnh cá nhân và mang theo pin sạc dự phòng để đảm bảo bạn không bị gián đoạn khi lưu lại những khoảnh khắc đẹp. Ngoài ra, hãy chuẩn bị đầy đủ các loại giấy tờ cần thiết như thẻ sinh viên, phiếu nhận bằng hoặc chứng minh nhân dân theo yêu cầu của nhà trường. Cuối cùng, hãy chuẩn bị trước những bó hoa tươi thắm, những món quà ý nghĩa cùng những lời chúc chân thành, đồng thời hẹn trước giờ giấc với hội bạn thân để cùng nhau chụp những bức hình kỷ niệm thật rực rỡ. Gradie tự hào được đồng hành cùng bạn trên mọi nẻo đường của mùa tốt nghiệp ý nghĩa!</p>",
    "image": "images/blog_checklist_tot_nghiep.jpg",
    "date": "26/06/2026",
    "author": "Gradie",
    "category": "Kinh Nghiệm",
    "status": "Published"
  },
  {
    "id": "b7",
    "title": "5 Mẹo Đơn Giản Để Có Bộ Ảnh Tốt Nghiệp Lung Linh Nhất",
    "excerpt": "Làm sao để lên hình thật xinh xắn và rạng rỡ trong ngày lễ tốt nghiệp? Gradie bật mí cho bạn 5 mẹo đơn giản từ trang phục, makeup đến dáng chụp để có những bức ảnh kỷ niệm để đời.",
    "content": "<p>Lễ tốt nghiệp là dịp để bạn ghi lại những khoảnh khắc rạng rỡ nhất bên thầy cô, gia đình và bạn bè. Để tấm hình kỷ niệm nào của bạn cũng lung linh và đầy sức sống, hãy lưu lại ngay 5 bí quyết chụp ảnh cực kỳ đơn giản và hiệu quả mà Gradie chia sẻ dưới đây nhé!</p>\n\n<p>Bí quyết đầu tiên là lựa chọn trang phục mặc bên trong áo cử nhân. Bạn nên ưu tiên những bộ cánh có tông màu sáng như trắng, kem, pastel và hạn chế tối đa các họa tiết cầu kỳ để tổng thể trang phục khi khoác áo cử nhân trông thanh lịch, gọn gàng nhất. Thứ hai, hãy trang điểm nhẹ nhàng theo phong cách tự nhiên và sử dụng lớp nền lâu trôi vì bạn sẽ phải hoạt động ngoài trời và dưới thời tiết nóng bức suốt nhiều giờ liền. Mẹo thứ ba là hãy làm tóc thật gọn gàng, có thể chọn kiểu tóc xõa tự nhiên hoặc buộc nửa đầu tinh tế để khi đội chiếc nón cử nhân lên trông gương mặt bạn vẫn thanh thoát và ăn ảnh.</p>\n<img src=\"images/blog_anh_tot_nghiep_xinh.jpg\" alt=\"Mẹo Chụp Ảnh Tốt Nghiệp Xinh Hơn\" style=\"width:100%; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">\n\n<p>Mẹo thứ tư vô cùng quan trọng đó là hãy chuẩn bị và tập trước từ 3 đến 5 dáng chụp ảnh cơ bản trước gương. Việc này giúp bạn không bị bỡ ngỡ, đơ cứng khi đứng trước ống kính và có thể nhanh chóng tạo dáng tự nhiên nhất. Cuối cùng, thời điểm chụp ảnh lý tưởng nhất là vào lúc sáng sớm (khoảng 7h - 9h) hoặc chiều muộn (khoảng 15h - 17h) khi ánh sáng mặt trời dịu nhẹ, tạo nên màu sắc ấm áp và không bị bóng mắt. Đừng quên chuẩn bị những phụ kiện xinh xắn từ Gradie để bức ảnh của bạn thêm phần sinh động và ý nghĩa nhé!</p>",
    "image": "images/blog_anh_tot_nghiep_xinh.jpg",
    "date": "26/06/2026",
    "author": "Admin",
    "category": "Mẹo Chọn Quà",
    "status": "Published"
  },
  {
    "id": "b8",
    "title": "Tặng Gì Cho Bestie Trong Ngày Tốt Nghiệp Ý Nghĩa Nhất?",
    "excerpt": "Bạn thân sắp ra trường và bạn đang băn khoăn không biết nên tặng món quà gì để chúc mừng cột mốc quan trọng này? Hãy để Gradie gợi ý cho bạn 5 món quà tốt nghiệp đong đầy tình cảm nhé!",
    "content": "<p>Ngày tốt nghiệp của người bạn thân thiết (bestie) là dịp đặc biệt để bạn bày tỏ sự chúc mừng chân thành và gửi gắm những lời chúc tốt đẹp nhất cho chặng đường tương lai của họ. Nếu bạn vẫn đang phân vân chưa biết chọn món quà nào vừa ý nghĩa vừa thiết thực, hãy cùng tham khảo 5 gợi ý quà tặng được yêu thích nhất từ Gradie dưới đây.</p>\n\n<p>Món quà truyền thống nhưng không bao giờ lỗi thời chính là những đóa hoa tốt nghiệp rực rỡ. Bạn có thể chọn hoa len thủ công bền vững hoặc hoa bóng bay nổi bật để người bạn của mình trông thật lung linh khi chụp ảnh kỷ yếu. Gợi ý thứ hai là những chú gấu bông tốt nghiệp cử nhân đáng yêu - người bạn đồng hành tinh thần biểu tượng cho sự đỗ đạt và thành công. Tiếp theo là những chiếc khung ảnh hoặc album kỷ niệm lưu giữ lại những tấm hình chung của cả hai suốt năm tháng ngồi trên giảng đường đại học, một món quà mang giá trị tinh thần vô cùng lớn lao.</p>\n<img src=\"images/blog_tang_gi_bestie.jpg\" alt=\"Quà Tốt Nghiệp Cho Bestie\" style=\"width:100%; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">\n\n<p>Nếu muốn tạo sự khác biệt, quà cá nhân hóa thêu tên riêng của bestie lên những chiếc túi vải, phụ kiện thời trang sẽ là lựa chọn tuyệt vời, chứng minh sự chu đáo và tỉ mỉ của bạn dành riêng cho họ. Cuối cùng, những bộ gift box nhỏ xinh được kết hợp tinh tế giữa nến thơm, phụ kiện và thiệp chúc mừng viết tay từ Gradie sẽ là lời chúc ngọt ngào, tiếp thêm động lực cho người bạn thân yêu trên hành trình mới. Hãy ghé Gradie ngay hôm nay để chọn lựa món quà hoàn hảo nhất cho bestie của mình nhé!</p>",
    "image": "images/blog_tang_gi_bestie.jpg",
    "date": "26/06/2026",
    "author": "Gradie",
    "category": "Ý Nghĩa Quà Tặng",
    "status": "Published"
  },
  {
    "id": "b9",
    "title": "Sau Tốt Nghiệp, Bắt Đầu Từ Đâu? 5 Bước Để Bớt Overthinking",
    "excerpt": "Vừa mới ra trường và cảm thấy mông lung, lo lắng trước tương lai phía trước? Hãy tham khảo ngay 5 bước nhỏ dưới đây từ Gradie để sắp xếp lại cuộc sống và giảm bớt sự lo âu quá mức nhé!",
    "content": "<p>Cảm giác mông lung, lo lắng và có chút \"overthinking\" sau khi tốt nghiệp đại học là điều hoàn toàn bình thường mà hầu hết các tân cử nhân đều trải qua. Để giúp bản thân giữ được sự bình tĩnh, chủ động và tràn đầy năng lượng khi bắt đầu chặng đường mới, hãy thử thực hiện theo 5 bước nhỏ cực kỳ thiết thực mà Gradie chia sẻ dưới đây.</p>\n\n<p>Bước đầu tiên bạn cần làm là dành thời gian cập nhật lại CV (hồ sơ xin việc) và portfolio (hồ sơ năng lực) của mình. Hãy hệ thống hóa các kiến thức đã học, các dự án thực tế và kỹ năng mềm tích lũy được trong suốt thời gian học tập để sẵn sàng gửi tới nhà tuyển dụng. Bước thứ hai là lập một danh sách các công việc hoặc lĩnh vực mà bạn thực sự muốn thử sức, từ đó giúp bạn định hình rõ nét hơn về mục tiêu nghề nghiệp. Bước thứ ba, hãy tranh thủ học thêm một kỹ năng mới hữu ích phục vụ cho công việc như ngoại ngữ, tin học văn phòng nâng cao, thiết kế đồ họa hoặc kỹ năng giao tiếp.</p>\n<img src=\"images/blog_sau_tot_nghiep.jpg\" alt=\"Vượt Qua Lo Âu Sau Tốt Nghiệp\" style=\"width:100%; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">\n\n<p>Bước thứ tư là tích cực kết nối, trò chuyện với các anh chị đi trước hoặc bạn bè đồng trang lứa đang làm việc trong ngành để lắng nghe những chia sẻ thực tế và có thêm định hướng đúng đắn. Cuối cùng, hãy đặt ra những mục tiêu nhỏ và cụ thể cho 30 ngày đầu tiên sau khi ra trường, thay vì tạo áp lực quá lớn cho bản thân phải có ngay công việc mơ ước. Hãy nhớ rằng tốt nghiệp không phải là vạch đích mà là điểm khởi đầu của một hành trình thú vị. Gradie luôn đồng hành và tiếp thêm động lực cho bạn tự tin vững bước kiến tạo tương lai!</p>",
    "image": "images/blog_sau_tot_nghiep.jpg",
    "date": "26/06/2026",
    "author": "Gradie",
    "category": "Câu Chuyện",
    "status": "Published"
  }
];

(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas successfully.');
    const db = client.db('gradie_db');
    const col = db.collection('blogPosts');

    for (const post of newPosts) {
      const existing = await col.findOne({ id: post.id });
      if (existing) {
        console.log(`Updating post ${post.id}: "${post.title}"`);
        await col.updateOne({ id: post.id }, { $set: post });
      } else {
        console.log(`Inserting new post ${post.id}: "${post.title}"`);
        await col.insertOne(post);
      }
    }
    console.log('✅ Sync completed. All 5 posts are saved to MongoDB Atlas.');
  } catch (err) {
    console.error('❌ Database operation error:', err);
  } finally {
    await client.close();
  }
})();
