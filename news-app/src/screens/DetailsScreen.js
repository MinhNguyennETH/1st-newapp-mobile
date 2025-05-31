// Import các thư viện cần thiết từ React và React Native
import React from 'react';
import { ScrollView, StyleSheet, Linking } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper'; // Thư viện UI
import * as Animatable from 'react-native-animatable'; // Thư viện hiệu ứng animation

/**
 * Component màn hình chi tiết bài viết
 * @param {Object} route - Đối tượng route từ React Navigation chứa thông tin điều hướng
 */
const DetailsScreen = ({ route }) => {
  // Lấy thông tin bài viết từ tham số điều hướng
  const { article } = route.params;
  // Phân rã các thuộc tính cần thiết từ đối tượng bài viết
  const { title, description, content, urlToImage, url, publishedAt } = article;

  /**
   * Định dạng ngày tháng thành chuỗi dễ đọc
   * @param {string} dateString - Chuỗi ngày tháng cần định dạng
   * @returns {string} Chuỗi ngày tháng đã được định dạng
   */
  const formatDate = (dateString) => {
    // Cấu hình các tùy chọn hiển thị ngày tháng
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    // Chuyển đổi chuỗi thành đối tượng Date và định dạng theo tùy chọn
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  /**
   * Xử lý khi người dùng nhấn vào nút đọc bài viết đầy đủ
   * Mở trình duyệt với URL của bài viết
   */
  const handleOpenArticle = async () => {
    try {
      // Sử dụng API Linking để mở URL trong trình duyệt mặc định
      await Linking.openURL(url);
    } catch (error) {
      // Xử lý lỗi nếu không thể mở URL
      console.error('Error opening URL:', error);
    }
  };

  // Render component
  return (
    <ScrollView style={styles.container}>
      {/* Bọc nội dung trong Animatable.View để thêm hiệu ứng */}
      <Animatable.View animation="fadeIn" duration={1000} useNativeDriver>
        {/* Sử dụng Card từ react-native-paper để hiển thị bài viết */}
        <Card style={styles.card}>
          {/* Hiển thị hình ảnh bài viết */}
          <Card.Cover
            source={{ uri: urlToImage || 'https://via.placeholder.com/300x200' }} // Sử dụng ảnh placeholder nếu không có
            style={styles.image}
          />
          <Card.Content>
            {/* Hiển thị tiêu đề bài viết */}
            <Title style={styles.title}>{title}</Title>
            {/* Hiển thị ngày xuất bản đã được định dạng */}
            <Paragraph style={styles.date}>{formatDate(publishedAt)}</Paragraph>
            {/* Hiển thị mô tả bài viết */}
            <Paragraph style={styles.description}>{description}</Paragraph>
            {/* Hiển thị nội dung bài viết */}
            <Paragraph style={styles.content}>{content}</Paragraph>
            
            {/* Nút để mở bài viết đầy đủ trong trình duyệt */}
            <Button
              mode="contained" // Kiểu nút đầy đủ
              onPress={handleOpenArticle} // Xử lý khi nhấn
              style={styles.button}
            >
              Read Full Article
            </Button>
          </Card.Content>
        </Card>
      </Animatable.View>
    </ScrollView>
  );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    backgroundColor: '#f5f5f5', // Màu nền xám nhạt
  },
  card: {
    margin: 16, // Khoảng cách xung quanh
    elevation: 4, // Đổ bóng cho Android
  },
  image: {
    height: 250, // Chiều cao cố định cho hình ảnh
  },
  title: {
    fontSize: 24, // Kích thước chữ lớn
    fontWeight: 'bold', // Độ đậm
    marginTop: 16, // Khoảng cách trên
  },
  date: {
    fontSize: 14, // Kích thước chữ nhỏ
    color: '#666', // Màu chữ xám
    marginTop: 8, // Khoảng cách trên
  },
  description: {
    fontSize: 16, // Kích thước chữ
    marginTop: 16, // Khoảng cách trên
    lineHeight: 24, // Khoảng cách giữa các dòng
  },
  content: {
    fontSize: 16, // Kích thước chữ
    marginTop: 16, // Khoảng cách trên
    lineHeight: 24, // Khoảng cách giữa các dòng
  },
  button: {
    marginTop: 24, // Khoảng cách trên
    marginBottom: 16, // Khoảng cách dưới
  },
});

// Export component để sử dụng ở nơi khác
export default DetailsScreen; 