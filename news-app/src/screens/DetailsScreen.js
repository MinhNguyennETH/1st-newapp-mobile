import React from "react";
import { ScrollView, StyleSheet, Linking } from "react-native";
import { Card, Title, Paragraph, Button } from "react-native-paper";
import * as Animatable from "react-native-animatable";

const DetailsScreen = ({ route }) => {
  // Lấy dữ liệu từ Home thông qua route.params
  const { article } = route.params;
  const { title, description, content, urlToImage, url, publishedAt } = article;

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Mở link bài viết gốc
  const handleOpenArticle = async () => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Thêm animation fade in khi màn hình hiện lên */}
      <Animatable.View animation="fadeIn" duration={1000} useNativeDriver>
        <Card style={styles.card}>
          {/* Hiển thị ảnh lớn với ảnh placeholder nếu không có ảnh */}
          <Card.Cover
            source={{
              uri: urlToImage || "https://via.placeholder.com/300x200",
            }}
            style={styles.image}
          />
          <Card.Content>
            {/* Hiển thị các thông tin chi tiết bài viết */}
            <Title style={styles.title}>{title}</Title>
            <Paragraph style={styles.date}>{formatDate(publishedAt)}</Paragraph>
            <Paragraph style={styles.description}>{description}</Paragraph>
            <Paragraph style={styles.content}>{content}</Paragraph>

            {/* Nút mở link bài viết gốc */}
            <Button
              mode="contained"
              onPress={handleOpenArticle}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  image: {
    height: 250,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    marginTop: 16,
    lineHeight: 24,
  },
  content: {
    fontSize: 16,
    marginTop: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
  },
});

export default DetailsScreen;
