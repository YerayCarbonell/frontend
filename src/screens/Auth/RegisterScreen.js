// src/screens/Auth/RegisterScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import api from '../../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('musico');

  // Estado para nuestro modal de alerta
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Función para mostrar el modal de alerta
  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showAlert('Campos vacíos', 'Por favor, completa todos los campos.');
      return;
    }
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Email inválido', 'Por favor, introduce un email válido.');
      return;
    }

    try {
      setIsLoading(true);

      const profileData =
        role === 'musico'
          ? { bio: 'Nuevo músico en StageLink', generos: ['Pop'] }
          : { bio: 'Nuevo organizador en StageLink' };

      const userData = {
        name,
        email,
        password,
        role, // "musico" u "organizador"
        profile: profileData,
      };

      const response = await api.post('/auth/register', userData);

      if (response.data.msg === "Usuario registrado con éxito") {
        showAlert('Éxito', '¡Registro completado! Por favor inicia sesión.');
        navigation.navigate('LoginScreen');
      } else {
        showAlert('Error', response.data.msg || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error de registro:', error);
      const errorMessage =
        error.response?.data?.msg || error.message || 'Error desconocido';
      showAlert('Error', `Registro fallido: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.logoCircle}>
              <Image 
                source={require('../../assets/images/logo.png')}
                style={styles.logoImage}
              />
            </View>
            <Text style={styles.title}>Regístrate</Text>
            <Text style={styles.subtitle}>Crea tu cuenta en StageLink</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={22}
                color="#BDC3C7"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nombre completo"
                placeholderTextColor="rgba(189, 195, 199, 0.6)"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={22}
                color="#BDC3C7"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="rgba(189, 195, 199, 0.6)"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#BDC3C7"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="rgba(189, 195, 199, 0.6)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#BDC3C7"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.roleTitle}>¿Eres músico u organizador?</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'musico' && styles.selectedRoleOption,
                ]}
                onPress={() => setRole('musico')}
              >
                <LinearGradient
                  colors={
                    role === 'musico'
                      ? ['#2E7D32', '#388E3C']
                      : ['transparent', 'transparent']
                  }
                  style={styles.roleGradient}
                >
                  <Ionicons
                    name="musical-notes"
                    size={32}
                    color={role === 'musico' ? 'white' : '#BDC3C7'}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === 'musico' && styles.selectedRoleText,
                    ]}
                  >
                    Músico
                  </Text>
                  {role === 'musico' && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#66BB6A"
                      style={styles.checkIcon}
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'organizador' && styles.selectedRoleOption,
                ]}
                onPress={() => setRole('organizador')}
              >
                <LinearGradient
                  colors={
                    role === 'organizador'
                      ? ['#2E7D32', '#388E3C']
                      : ['transparent', 'transparent']
                  }
                  style={styles.roleGradient}
                >
                  <Ionicons
                    name="people"
                    size={32}
                    color={role === 'organizador' ? 'white' : '#BDC3C7'}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === 'organizador' && styles.selectedRoleText,
                    ]}
                  >
                    Organizador
                  </Text>
                  {role === 'organizador' && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#66BB6A"
                      style={styles.checkIcon}
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <LottieView
                  source={require('../../assets/animations/loading.json')}
                  autoPlay
                  loop
                  style={styles.loadingAnimation}
                />
              ) : (
                <Text style={styles.buttonText}>Registrarse</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.loginTextBold}>Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Modal custom para mostrar alertas */}
      <Modal
        transparent
        animationType="fade"
        visible={alertVisible}
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {alertTitle !== '' && (
              <Text style={styles.modalTitle}>{alertTitle}</Text>
            )}
            <Text style={styles.modalMessage}>{alertMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setAlertVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    elevation: 5,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  title: { color: '#2E7D32', fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { color: '#66BB6A', fontSize: 16 },
  formContainer: { marginTop: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 245, 233, 0.8)',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#2E7D32', height: 50 },
  eyeIcon: { padding: 10 },
  roleTitle: {
    color: '#388E3C',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  roleOption: {
    width: '48%',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    overflow: 'hidden',
  },
  selectedRoleOption: { borderColor: '#2E7D32' },
  roleGradient: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  roleText: { color: '#388E3C', fontSize: 14, marginTop: 10, fontWeight: '600' },
  selectedRoleText: { color: 'white' },
  checkIcon: { position: 'absolute', top: 10, right: 10 },
  button: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  loginButton: { marginTop: 20, alignItems: 'center' },
  loginText: { color: '#388E3C' },
  loginTextBold: { color: 'white', fontWeight: 'bold' },
  loadingAnimation: { width: 50, height: 50 },
  // Estilos para el modal custom de alerta
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  modalButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  modalButtonText: { color: 'white', fontSize: 16 },
});
