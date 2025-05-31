// Import các thư viện và hooks cần thiết từ React và React Native
import React, { useState, useEffect } from 'react';
import {
  View, // Component để tạo container
  Text, // Component để hiển thị văn bản
  StyleSheet, // API để tạo và quản lý styles
  Image, // Component để hiển thị hình ảnh
  TouchableOpacity, // Component tạo vùng có thể nhấn
  Dimensions, // API để lấy kích thước màn hình
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Thư viện biểu tượng
import { saveBookmark, removeBookmark, isArticleBookmarked } from '../services/bookmarkService'; // Import các hàm xử lý bookmark

/**
 * Component hiển thị một thẻ tin tức
 * @param {Object} article - Đối tượng chứa thông tin bài viết
 * @param {Function} onPress - Hàm xử lý khi nhấn vào thẻ
 * @param {boolean} isBookmarked - Trạng thái đánh dấu ban đầu (mặc định là false)
 */
const NewsCard = ({ article, onPress, isBookmarked: initialIsBookmarked = false }) => {
  // State lưu trạng thái đánh dấu của bài viết
  const [bookmarked, setBookmarked] = useState(initialIsBookmarked);

  // Effect kiểm tra trạng thái đánh dấu khi component được render
  useEffect(() => {
    // Chỉ kiểm tra nếu không có trạng thái ban đầu
    if (!initialIsBookmarked) {
      checkBookmarkStatus();
    }
  }, [initialIsBookmarked]);

  /**
   * Kiểm tra xem bài viết đã được đánh dấu hay chưa
   */
  const checkBookmarkStatus = async () => {
    // Gọi API kiểm tra trạng thái đánh dấu dựa trên URL của bài viết
    const status = await isArticleBookmarked(article.url);
    // Cập nhật state với kết quả
    setBookmarked(status);
  };

  /**
   * Xử lý khi người dùng nhấn vào nút đánh dấu
   * @param {Object} event - Sự kiện nhấn
   */
  const handleBookmarkPress = async (event) => {
    event.stopPropagation(); // Ngăn sự kiện lan truyền lên thẻ cha (ngăn kích hoạt onPress của thẻ)
    try {
      if (bookmarked) {
        // Nếu đã đánh dấu, thực hiện bỏ đánh dấu
        const removed = await removeBookmark(article.url);
        if (removed) {
          // Cập nhật state nếu bỏ đánh dấu thành công
          setBookmarked(false);
        }
      } else {
        // Nếu chưa đánh dấu, thực hiện đánh dấu
        const saved = await saveBookmark(article);
        if (saved) {
          // Cập nhật state nếu đánh dấu thành công
          setBookmarked(true);
        }
      }
    } catch (error) {
      // Ghi log lỗi nếu có
      console.error('Error handling bookmark:', error);
    }
  };

  // Render component
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Hiển thị hình ảnh bài viết, sử dụng ảnh placeholder nếu không có */}
      <Image
        source={{ uri: article.urlToImage || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.content}>
        {/* Hiển thị tiêu đề bài viết, giới hạn 2 dòng */}
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        {/* Hiển thị mô tả bài viết, giới hạn 3 dòng */}
        <Text style={styles.description} numberOfLines={3}>
          {article.description}
        </Text>
        {/* Phần footer chứa nguồn và nút đánh dấu */}
        <View style={styles.footer}>
          {/* Hiển thị tên nguồn tin */}
          <Text style={styles.source}>{article.source.name}</Text>
          {/* Nút đánh dấu */}
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleBookmarkPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Mở rộng vùng có thể nhấn
          >
            {/* Hiển thị biểu tượng đánh dấu dựa trên trạng thái */}
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-border'} // Biểu tượng đầy đủ nếu đã đánh dấu, viền nếu chưa
              size={24} // Kích thước biểu tượng
              color="#007AFF" // Màu biểu tượng
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white', // Nền trắng cho thẻ
    borderRadius: 12, // Bo tròn góc
    marginBottom: 16, // Khoảng cách dưới
    elevation: 3, // Đổ bóng cho Android
    shadowColor: '#000', // Màu bóng cho iOS
    shadowOffset: { width: 0, height: 2 }, // Vị trí bóng
    shadowOpacity: 0.25, // Độ mờ của bóng
    shadowRadius: 3.84, // Bán kính bóng
  },
  image: {
    width: '100%', // Chiều rộng 100%
    height: 200, // Chiều cao cố định
    borderTopLeftRadius: 12, // Bo tròn góc trên bên trái
    borderTopRightRadius: 12, // Bo tròn góc trên bên phải
  },
  content: {
    padding: 16, // Đệm nội dung
  },
  title: {
    fontSize: 18, // Kích thước chữ
    fontWeight: 'bold', // Độ đậm
    marginBottom: 8, // Khoảng cách dưới
  },
  description: {
    fontSize: 14, // Kích thước chữ
    color: '#666', // Màu chữ xám
    marginBottom: 8, // Khoảng cách dưới
  },
  footer: {
    flexDirection: 'row', // Sắp xếp theo hàng ngang
    justifyContent: 'space-between', // Căn đều hai bên
    alignItems: 'center', // Căn giữa theo chiều dọc
    marginTop: 8, // Khoảng cách trên
  },
  source: {
    fontSize: 12, // Kích thước chữ
    color: '#007AFF', // Màu chữ xanh
  },
  bookmarkButton: {
    padding: 8, // Đệm nút
    marginLeft: 8, // Khoảng cách trái
  },
});

// Export component để sử dụng ở nơi khác
export default NewsCard; 