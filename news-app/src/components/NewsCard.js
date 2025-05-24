import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const NewsCard = ({ article, onPress }) => {
  const { title, description, urlToImage, publishedAt } = article;
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Card style={styles.card}>
        <Card.Cover
          source={{ uri: urlToImage || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
        />
        <Card.Content>
          <Title numberOfLines={2} style={styles.title}>{title}</Title>
          <Paragraph numberOfLines={3} style={styles.description}>{description}</Paragraph>
          <Paragraph style={styles.date}>{formatDate(publishedAt)}</Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    elevation: 4,
    borderRadius: 8,
  },
  image: {
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

export default NewsCard; 