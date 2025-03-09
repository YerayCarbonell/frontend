import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Image,
  FlatList,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function HomeScreen({ navigation }) {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const numColumns = isWeb && width > 768 ? 2 : 1;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const loadData = async () => {
      try {
        const [userRes, eventsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/events')
        ]);
        setUser(userRes.data);
        setEvents(eventsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const renderEventCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item._id })}
    >
      <Image 
        source={{ uri: item.image || '../assets/images/default-event.jpg' }} 
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.name}</Text>
        <View style={styles.eventMeta}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.eventDate}>{new Date(item.date).toLocaleDateString()}</Text>
          <Ionicons name="location" size={16} color="#666" style={styles.locationIcon} />
          <Text style={styles.eventLocation}>{item.location}</Text>
        </View>
        <Text style={styles.eventDescription} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#FFFFFF']}
        style={styles.background}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>  
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.welcomeText}>
            {user?.name ? `Bienvenido, ${user.name}` : 'Encuentra tu próximo evento'}
          </Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons 
              name="person-circle-outline" 
              size={34} 
              color="#4CAF50" 
            />
          </TouchableOpacity>
        </Animated.View>

        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={item => item._id}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Eventos disponibles</Text>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
          }
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logo: {
    width: 70,
    height: 60,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
    flex: 1,
    textAlign: 'center',
  },
  profileButton: {
    padding: 5,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#eee',
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 15,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
  },
  eventDescription: {
    fontSize: 14,
    color: '#444',
  },
});
