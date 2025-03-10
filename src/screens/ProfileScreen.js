import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity,
  TextInput,
  Platform,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  // Opciones fijas para selección
  const fixedGeneros = ['Pop', 'Rock', 'Jazz', 'Clásico', 'Reggaetón', 'Hip Hop'];
  const fixedInstrumentos = ['Guitarra', 'Piano', 'Batería', 'Bajo', 'Violín', 'Saxofón'];
  const fixedTipoEventos = ['Conciertos', 'Festivales', 'Eventos corporativos', 'Eventos privados'];

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para edición
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [local, setLocal] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // Estados para las selecciones fijas
  const [selectedGeneros, setSelectedGeneros] = useState([]);
  const [selectedInstrumentos, setSelectedInstrumentos] = useState([]);
  const [selectedTipoEventos, setSelectedTipoEventos] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Asegúrate de que este endpoint sea el correcto en tu backend
        const response = await api.get('/users/me');
        setUser(response.data);
        setName(response.data.name);
        setBio(response.data.profile.bio || '');
        if(response.data.role === 'musico'){
          setSelectedGeneros(response.data.profile.generos || []);
          setSelectedInstrumentos(response.data.profile.instrumentos || []);
          setSelectedTipoEventos(response.data.profile.tipoEventos || []);
        } else if(response.data.role === 'organizador'){
          setLocal(response.data.profile.local || '');
          setSelectedTipoEventos(response.data.profile.tipoEventos || []);
          setSelectedInstrumentos(response.data.profile.instrumentos || []);
          setSelectedGeneros(response.data.profile.generos || []);
        }
        // Si el usuario tiene foto en su perfil (campo "photo"), se carga
        if(response.data.profile.photo) {
          setProfileImage(response.data.profile.photo);
        }
      } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Lo siento, necesitamos permisos para acceder a la galería.');
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.cancelled) {
      if (Platform.OS !== 'web') {
        // Copia la imagen al directorio de la app
        const imageName = result.uri.split('/').pop();
        const newPath = FileSystem.documentDirectory + 'images/' + imageName;
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'images/', { intermediates: true }).catch(() => {});
        await FileSystem.copyAsync({
          from: result.uri,
          to: newPath
        });
        setProfileImage(newPath);
      } else {
        setProfileImage(result.uri);
      }
    }
  };

  // Funciones para alternar selección en cada lista fija
  const toggleGenero = (option) => {
    setSelectedGeneros(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const toggleInstrumento = (option) => {
    setSelectedInstrumentos(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const toggleTipoEvento = (option) => {
    setSelectedTipoEventos(prev =>
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const handleSave = async () => {
    // Construir objeto profile actualizado usando las selecciones fijas
    let updatedProfile = { bio };
    if(user.role === 'musico'){
      updatedProfile.generos = selectedGeneros;
      updatedProfile.instrumentos = selectedInstrumentos;
      updatedProfile.tipoEventos = selectedTipoEventos;
    } else if(user.role === 'organizador'){
      updatedProfile.local = local;
      updatedProfile.tipoEventos = selectedTipoEventos;
      updatedProfile.instrumentos = selectedInstrumentos;
      updatedProfile.generos = selectedGeneros;
    }
    if(profileImage) {
      updatedProfile.photo = profileImage;
    }
    try {
      const response = await api.put('/users/profile', { name, profile: updatedProfile });
      setUser(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error al cargar los datos del usuario.</Text>
      </View>
    );
  }

  const { email, role, multimedia } = user;

  return (
    <LinearGradient colors={['#E8F5E9', '#C8E6C9', '#FFFFFF']} style={[styles.background, { flex: 1 }]}>
    <SafeAreaView style={{ flex: 1 }}>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {/* Header con botón de volver y editar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <TouchableOpacity onPress={() => {
            if(isEditing){
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}>
            <Text style={styles.editButton}>{isEditing ? 'Guardar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {/* Datos principales del usuario */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={isEditing ? pickImage : null}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Image source={require('../assets/images/default-profile.png')} style={styles.profileImage} />
              )}
              {isEditing && (
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={24} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          {isEditing ? (
            <TextInput 
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
            />
          ) : (
            <Text style={styles.name}>{name}</Text>
          )}
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.role}>{role === 'musico' ? 'Músico' : 'Organizador'}</Text>
        </View>

        {/* Sección de biografía */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biografía</Text>
          {isEditing ? (
            <TextInput 
              style={[styles.sectionContent, { height: 80, textAlignVertical: 'top' }]}
              value={bio}
              onChangeText={setBio}
              multiline
            />
          ) : (
            <Text style={styles.sectionContent}>{bio || 'Sin biografía'}</Text>
          )}
        </View>

        {/* Secciones según el rol */}
        {role === 'musico' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Géneros</Text>
              {isEditing ? (
                <View style={styles.optionsContainer}>
                  {fixedGeneros.map((option, index) => {
                    const selected = selectedGeneros.includes(option);
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => toggleGenero(option)} 
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.sectionContent}>
                  {selectedGeneros.length > 0 ? selectedGeneros.join(', ') : 'Sin géneros'}
                </Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instrumentos</Text>
              {isEditing ? (
                <View style={styles.optionsContainer}>
                  {fixedInstrumentos.map((option, index) => {
                    const selected = selectedInstrumentos.includes(option);
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => toggleInstrumento(option)} 
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.sectionContent}>
                  {selectedInstrumentos.length > 0 ? selectedInstrumentos.join(', ') : 'Sin instrumentos'}
                </Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Eventos</Text>
              {isEditing ? (
                <View style={styles.optionsContainer}>
                  {fixedTipoEventos.map((option, index) => {
                    const selected = selectedTipoEventos.includes(option);
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => toggleTipoEvento(option)} 
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.sectionContent}>
                  {selectedTipoEventos.length > 0 ? selectedTipoEventos.join(', ') : 'Sin eventos preferidos'}
                </Text>
              )}
            </View>
          </>
        )}

        {role === 'organizador' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Local</Text>
              {isEditing ? (
                <TextInput
                  style={styles.sectionContent}
                  value={local}
                  onChangeText={setLocal}
                  placeholder="Nombre del local"
                />
              ) : (
                <Text style={styles.sectionContent}>{local || 'Sin información de local'}</Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Géneros</Text>
              {isEditing ? (
                <View style={styles.optionsContainer}>
                  {fixedGeneros.map((option, index) => {
                    const selected = selectedGeneros.includes(option);
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => toggleGenero(option)} 
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.sectionContent}>
                  {selectedGeneros.length > 0 ? selectedGeneros.join(', ') : 'Sin géneros'}
                </Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instrumentos</Text>
              {isEditing ? (
                <View style={styles.optionsContainer}>
                  {fixedInstrumentos.map((option, index) => {
                    const selected = selectedInstrumentos.includes(option);
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => toggleInstrumento(option)} 
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.sectionContent}>
                  {selectedInstrumentos.length > 0 ? selectedInstrumentos.join(', ') : 'Sin instrumentos'}
                </Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Eventos</Text>
              {isEditing ? (
                <View style={styles.optionsContainer}>
                  {fixedTipoEventos.map((option, index) => {
                    const selected = selectedTipoEventos.includes(option);
                    return (
                      <TouchableOpacity 
                        key={index} 
                        onPress={() => toggleTipoEvento(option)} 
                        style={[styles.optionButton, selected && styles.optionButtonSelected]}
                      >
                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.sectionContent}>
                  {selectedTipoEventos.length > 0 ? selectedTipoEventos.join(', ') : 'Sin eventos preferidos'}
                </Text>
              )}
            </View>
          </>
        )}

        {/* Sección Multimedia (no editable en este ejemplo) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Multimedia</Text>
          <Text style={styles.sectionContent}>
            Fotos: {multimedia.fotos && multimedia.fotos.length > 0 ? multimedia.fotos.length : 0} - 
            Audio: {multimedia.audio && multimedia.audio.length > 0 ? multimedia.audio.length : 0}
          </Text>
        </View>
      </ScrollView>
      </SafeAreaView>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  editButton: {
    fontSize: 16,
    color: '#2E7D32',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2E7D32',
    borderRadius: 15,
    padding: 5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    borderBottomWidth: 1,
    width: '80%',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  role: {
    fontSize: 16,
    color: '#2E7D32',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionContent: {
    fontSize: 16,
    color: '#444',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 20,
    margin: 4,
  },
  optionButtonSelected: {
    backgroundColor: '#2E7D32',
  },
  optionText: {
    color: '#2E7D32',
  },
  optionTextSelected: {
    color: '#fff',
  },
});
