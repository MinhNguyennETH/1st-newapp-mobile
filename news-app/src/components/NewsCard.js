import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { saveBookmark, removeBookmark, isArticleBookmarked } from '../services/bookmarkService';

const NewsCard = ({ article, onPress, isBookmarked: initialIsBookmarked = false }) => {
  const [bookmarked, setBookmarked] = useState(initialIsBookmarked);

  useEffect(() => {
    if (!initialIsBookmarked) {
      checkBookmarkStatus();
    }
  }, [initialIsBookmarked]);

  const checkBookmarkStatus = async () => {
    const status = await isArticleBookmarked(article.url);
    setBookmarked(status);
  };

  const handleBookmarkPress = async (event) => {
    event.stopPropagation(); // Prevent triggering the card's onPress
    try {
      if (bookmarked) {
        const removed = await removeBookmark(article.url);
        if (removed) {
          setBookmarked(false);
        }
      } else {
        const saved = await saveBookmark(article);
        if (saved) {
          setBookmarked(true);
        }
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: article.urlToImage || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {article.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.source}>{article.source.name}</Text>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleBookmarkPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={bookmarked ? 'bookmark' : 'bookmark-border'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  source: {
    fontSize: 12,
    color: '#007AFF',
  },
  bookmarkButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default NewsCard; 