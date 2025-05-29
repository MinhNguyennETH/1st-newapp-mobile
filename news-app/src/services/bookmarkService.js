import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@news_bookmarks';

export const getBookmarks = async () => {
  try {
    const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return bookmarksJson ? JSON.parse(bookmarksJson) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const saveBookmark = async (article) => {
  try {
    const bookmarks = await getBookmarks();
    const isBookmarked = bookmarks.some((bookmark) => bookmark.url === article.url);
    
    if (!isBookmarked) {
      const updatedBookmarks = [...bookmarks, article];
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving bookmark:', error);
    return false;
  }
};

export const removeBookmark = async (articleUrl) => {
  try {
    const bookmarks = await getBookmarks();
    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.url !== articleUrl);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

export const isArticleBookmarked = async (articleUrl) => {
  try {
    const bookmarks = await getBookmarks();
    return bookmarks.some((bookmark) => bookmark.url === articleUrl);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
}; 