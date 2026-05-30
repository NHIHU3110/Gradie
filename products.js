const PRODUCTS = [
  {
    id:"SP001",url:"gau_bong_tot_nghiep",
    name:"Gấu Bông Capybara Tốt Nghiệp",
    category:"Gấu Bông",tag:"hot-products",
    desc:"Gấu bông tốt nghiệp với khuôn mặt điềm tĩnh kết hợp áo choàng, mũ cử nhân và băng Congratulations. Chất liệu bông gòn 7D trắng muốt, vải miniso mềm mịn.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp001_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp001_2.jpg"],
    variants:[
      {sku:"SP001-1",attr1:"Capybara",attr2:"35cm",price:115000,compare:145000},
      {sku:"SP001-2",attr1:"Capybara",attr2:"20cm",price:135000,compare:165000}
    ]
  },
  {
    id:"SP002",url:"gau_bong_tot_nghiep_in_logo",
    name:"Gấu Bông Tốt Nghiệp Gradie",
    category:"Gấu Bông",tag:"hot-products",
    desc:"Gấu bông tốt nghiệp 20cm, khoác áo choàng và đội mũ cử nhân. Có thể in tên cá nhân hoá. Bông gòn nhân tạo 3 chiều, mềm mại, an toàn.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp002_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp002_2.jpg"],
    variants:[
      {sku:"SP002-1",attr1:"Có kính, không in",attr2:"20cm",price:65000,compare:75000},
      {sku:"SP002-2",attr1:"Có kính, in tên",attr2:"20cm",price:80000,compare:90000},
      {sku:"SP002-3",attr1:"Không kính, không in",attr2:"20cm",price:60000,compare:65000},
      {sku:"SP002-4",attr1:"Không kính, in tên",attr2:"20cm",price:70000,compare:80000}
    ]
  },
  {
    id:"SP003",url:"qua_tang_bup_be_tot_nghiep",
    name:"Búp Bê Móc Len Tốt Nghiệp",
    category:"Gấu Bông",tag:"frontpage",
    desc:"Búp bê tốt nghiệp handmade 100% từ len. Cao 20–23cm, mặc áo choàng, đội mũ cử nhân, cầm bằng và hoa. Có thể làm size lớn hoặc mẫu riêng theo yêu cầu.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp003_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp003_2.jpg"],
    variants:[
      {sku:"SP003-1",attr1:"Nữ, có đế",attr2:"23cm",price:419000,compare:429000},
      {sku:"SP003-2",attr1:"Nữ, không đế",attr2:"20cm",price:399000,compare:409000},
      {sku:"SP003-3",attr1:"Nam, có đế",attr2:"23cm",price:419000,compare:429000},
      {sku:"SP003-4",attr1:"Nam, không đế",attr2:"20cm",price:399000,compare:409000}
    ]
  },
  {
    id:"SP004",url:"bo_hoa_len_tot_nghiep",
    name:"Bó Hoa Móc Len Hướng Dương",
    category:"Hoa mừng",tag:"onsale",
    desc:"Bó hoa len handmade, cao 50cm, gồm 1 gấu nhỏ + 5 bông hướng dương rực rỡ. Phù hợp làm quà tặng tốt nghiệp hoặc trang trí bàn học.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp004_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp004_2.jpg"],
    variants:[{sku:"SP004-1",attr1:"Bó hoa",attr2:"50cm",price:149000,compare:159000}]
  },
  {
    id:"SP005",url:"bo_hoa_sap_ecuado",
    name:"Bó Hoa Hồng Sáp Ecuador",
    category:"Hoa mừng",tag:"frontpage",
    desc:"Bó hoa sáp Ecuador 15 bông, kết hợp hoa sáp và hoa nhũ kim tuyến. Vẻ đẹp vĩnh cửu, không tàn phai. Tặng kèm nơ và giấy gói sang trọng.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp005_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp005_2.jpg"],
    variants:[{sku:"SP005-1",attr1:"Bó hoa",attr2:"30cm",price:209000,compare:229000}]
  },
  {
    id:"SP006",url:"bo_hoa_bong_bong",
    name:"Bó Hoa Bóng Bay Tốt Nghiệp",
    category:"Hoa mừng",tag:"onsale",
    desc:"Hoa bóng bay cao cấp, màu sắc chuẩn đẹp, trang trí nơ và bóng trái tim chữ Happy Graduation. Phù hợp chụp kỷ yếu, tặng người yêu.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp006_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp006_2.jpg"],
    variants:[{sku:"SP006-1",attr1:"Bó hoa",attr2:"80cm",price:359000,compare:389000}]
  },
  {
    id:"SP007",url:"keo_khong_lo",
    name:"Túi Kẹo Quà Tặng Khổng Lồ",
    category:"Kẹo",tag:"frontpage",
    desc:"Kẹo khổng lồ mix nhiều loại bánh kẹo, bim bim và snack. Tặng kèm túi đựng và thiệp. Hạn sử dụng 3–6 tháng. Phù hợp tặng bé, bạn bè, cả lớp.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp007_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp007_3.jpg"],
    variants:[
      {sku:"SP007-1",attr1:"Hồng",attr2:"30cm",price:49000,compare:59000},
      {sku:"SP007-2",attr1:"Đỏ",attr2:"30cm",price:49000,compare:59000},
      {sku:"SP007-3",attr1:"Xanh",attr2:"30cm",price:49000,compare:59000}
    ]
  },
  {
    id:"SP008",url:"keo_mut_trai_tim",
    name:"Túi Kẹo Lớn Hình Trái Tim",
    category:"Kẹo",tag:"hot-products",
    desc:"Bó kẹo mút hình trái tim trong suốt, mix trên 10 loại bánh kẹo. Trang trí nơ ruy băng và họa tiết hoạt hình. Màu hồng hoặc xanh.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp008_1.jpg"],
    variants:[
      {sku:"SP008-1",attr1:"Hồng",attr2:"90cm",price:89000,compare:99000},
      {sku:"SP008-2",attr1:"Xanh",attr2:"90cm",price:89000,compare:99000}
    ]
  },
  {
    id:"SP009",url:"khung_anh_ghep_do_tot_nghiep",
    name:"Khung Ảnh Tốt Nghiệp Chibi",
    category:"Khung ảnh",tag:"",
    desc:"Khung ảnh chibi dễ thương, có thể cá nhân hoá với tên và hình ảnh. Nhựa bền, mặt kính sáng bóng. Phù hợp làm quà lưu niệm.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp009_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp009_2.jpg"],
    variants:[
      {sku:"SP009-1",attr1:"Chữ nhật",attr2:"10x15cm",price:64000,compare:74000},
      {sku:"SP009-2",attr1:"Chữ nhật",attr2:"13x18cm",price:75000,compare:85000}
    ]
  },
  {
    id:"SP029",url:"khung_anh_3d_totnghiep",
    name:"Khung Ảnh Tốt Nghiệp 3D LED",
    category:"Khung ảnh",tag:"",
    desc:"Khung ảnh tốt nghiệp 3D có đèn LED, chân chống, móc treo tường. Nhựa giả gỗ composite nhẹ, bền, mặt kính sáng bóng. Tặng kèm 1 ảnh in.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp029_2.jpg"],
    variants:[
      {sku:"SP029-1",attr1:"Chữ nhật",attr2:"15x21cm",price:139000,compare:149000},
      {sku:"SP029-2",attr1:"Vuông",attr2:"18x18cm",price:159000,compare:169000}
    ]
  },
  {
    id:"SP030",url:"huy_chuong_chuc_mung_tot_nghiep",
    name:"Huy Chương Tốt Nghiệp",
    category:"Huy Chương",tag:"onsale",
    desc:"Huy chương tốt nghiệp vàng, dây đeo đỏ-trắng-xanh. In hình sinh viên cá nhân hoá mặc áo choàng. Đi kèm hộp quà và giấy gói.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp030_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp030_2.jpg"],
    variants:[
      {sku:"SP030-1",attr1:"Xanh đen",attr2:"Hình tròn",price:69000,compare:79000},
      {sku:"SP030-2",attr1:"Vàng cam",attr2:"Hình tròn",price:69000,compare:79000},
      {sku:"SP030-3",attr1:"Da trời",attr2:"Hình tròn",price:69000,compare:79000}
    ]
  },
  {
    id:"SP031",url:"den_ngu_gau_tot_nghiep",
    name:"Hộp Tuyết Thủy Tinh Gấu Tốt Nghiệp",
    category:"Đèn Ngủ",tag:"onsale",
    desc:"Hộp tuyết cầu thủy tinh, bên trong gấu mặc áo choàng + hoa hướng dương/tulip, đế gỗ có đèn LED. Thiết kế tinh tế, ánh sáng lung linh.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp031_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp031_2.jpg"],
    variants:[
      {sku:"SP031-1",attr1:"Vàng",attr2:"Hướng dương, nam",price:159000,compare:165000},
      {sku:"SP031-2",attr1:"Vàng",attr2:"Hướng dương, nữ",price:159000,compare:165000},
      {sku:"SP031-3",attr1:"Hồng",attr2:"Tulip Gấu",price:159000,compare:165000},
      {sku:"SP031-4",attr1:"Xanh",attr2:"Tulip Gấu",price:159000,compare:165000}
    ]
  },
  {
    id:"SP032",url:"den_guong_tulip",
    name:"Hộp Thủy Tinh Vuông 30 Bông Hoa",
    category:"Đèn Ngủ",tag:"onsale",
    desc:"Đèn ngủ 2-in-1 kiêm gương soi. Hộp thủy tinh vuông 10x10x10cm chứa 30 bông hoa mini. Hiệu ứng vô cực lung linh. DIY độc đáo.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp032_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp032_2.jpg"],
    variants:[
      {sku:"SP032-1",attr1:"Hồng",attr2:"Vuông",price:49000,compare:59000},
      {sku:"SP032-2",attr1:"Xanh",attr2:"Vuông",price:49000,compare:59000},
      {sku:"SP032-3",attr1:"Tím",attr2:"Vuông",price:49000,compare:59000},
      {sku:"SP032-4",attr1:"Nhiều màu",attr2:"Vuông",price:49000,compare:59000}
    ]
  },
  {
    id:"SP033",url:"den_ngu_silicon",
    name:"Đèn LED Thú Dễ Thương Silicon",
    category:"Đèn Ngủ",tag:"onsale",
    desc:"Đèn ngủ mini silicon hình thỏ/vịt/rồng. Pin 1200mAh, dùng 6–12 giờ, sạc 2–3 giờ. Ánh sáng dịu, bảo vệ mắt, phù hợp cả trẻ em và người lớn.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp033_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp033_2.jpg"],
    variants:[
      {sku:"SP033-1",attr1:"Thỏ",attr2:"Trắng, vàng",price:109000,compare:119000},
      {sku:"SP033-2",attr1:"Vịt",attr2:"Trắng, vàng",price:109000,compare:119000},
      {sku:"SP033-3",attr1:"Rồng",attr2:"Trắng, vàng",price:109000,compare:119000}
    ]
  },
  {
    id:"SP034",url:"non_tot_nghiep_hoa_lua",
    name:"Mũ Cử Nhân Trang Trí Hoa Lụa",
    category:"Đồ tốt nghiệp",tag:"frontpage",
    desc:"Mũ cử nhân trang trí tỉ mỉ: decal kim tuyến, ruy băng, hoa lụa, bướm và ngọc trai. Điểm nhấn ấn tượng cho ảnh lễ tốt nghiệp.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp034_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp034_2.jpg"],
    variants:[
      {sku:"SP034-1",attr1:"Bướm",attr2:"Xanh",price:189000,compare:199000},
      {sku:"SP034-2",attr1:"Hoa hồng",attr2:"Đỏ",price:189000,compare:199000},
      {sku:"SP034-3",attr1:"Hoa Tulip",attr2:"Hồng",price:189000,compare:199000}
    ]
  },
  {
    id:"SP035",url:"ao_cu_nhan",
    name:"Bộ Lễ Phục Cử Nhân",
    category:"Đồ tốt nghiệp",tag:"frontpage",
    desc:"Bộ lễ phục cử nhân quốc tế màu đen, gồm áo choàng và mũ tốt nghiệp. Chất liệu cotton bền đẹp, kiểu dáng chuẩn mực và trang nghiêm.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp035_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp035_2.jpg"],
    variants:[
      {sku:"SP035-1",attr1:"Bộ áo mũ",attr2:"Xanh, trắng",price:339000,compare:349000},
      {sku:"SP035-2",attr1:"Bộ áo mũ, nơ",attr2:"Xanh, trắng",price:369000,compare:379000}
    ]
  },
  {
    id:"SP036",url:"sash_tot_nghiep",
    name:"Sash Tốt Nghiệp Đeo Chéo",
    category:"Đồ tốt nghiệp",tag:"frontpage",
    desc:"Sash đeo chéo trang trọng, in tên cá nhân hoá. Kích thước 170x120cm, may chắc chắn. Tạo điểm nhấn nổi bật cho ảnh kỷ yếu.",
    images:["https://cdn.hstatic.net/files/200001178391/file/sp036_1.jpg","https://cdn.hstatic.net/files/200001178391/file/sp036_2.jpg"],
    variants:[{sku:"SP036-1",attr1:"Sash tên",attr2:"Trắng",price:149000,compare:159000}]
  }
];
