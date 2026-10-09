import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useAuth } from '../context/AuthContext'
import { colors, getErrorMessage } from '../utils/helpers'

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Full name must be at least 2 characters'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email format'
    if (!password || password.length < 6) e.password = 'Password must be at least 6 characters'
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await register(fullName.trim(), email.trim(), password)
    } catch (err) {
      Alert.alert('Registration Failed', getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>P</Text>
          </View>
          <Text style={styles.logoText}>ProjectFlow</Text>
        </View>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start managing projects today</Text>

        <View style={styles.form}>
          {[
            { label: 'Full Name', value: fullName, setter: setFullName, err: errors.fullName, placeholder: 'John Doe', key: 'fullName' },
            { label: 'Email', value: email, setter: setEmail, err: errors.email, placeholder: 'you@example.com', key: 'email', email: true },
            { label: 'Password', value: password, setter: setPassword, err: errors.password, placeholder: '••••••••', key: 'password', secure: true },
            { label: 'Confirm Password', value: confirmPassword, setter: setConfirmPassword, err: errors.confirmPassword, placeholder: '••••••••', key: 'confirmPassword', secure: true },
          ].map(({ label, value, setter, err, placeholder, key, email: isEmail, secure }) => (
            <View key={key} style={styles.fieldGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, err && styles.inputError]}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={setter}
                keyboardType={isEmail ? 'email-address' : 'default'}
                autoCapitalize={isEmail || secure ? 'none' : 'words'}
                secureTextEntry={!!secure}
                testID={`${key}-input`}
              />
              {err && <Text style={styles.errorText}>{err}</Text>}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            testID="register-btn"
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.btnText}>Create account</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoBox: { width: 36, height: 36, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoLetter: { color: '#fff', fontSize: 18, fontWeight: '700' },
  logoText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  form: {},
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: colors.textPrimary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surface },
  inputError: { borderColor: colors.danger },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4 },
  btn: { backgroundColor: colors.primary, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 13, color: colors.textSecondary },
  footerLink: { fontSize: 13, color: colors.primary, fontWeight: '500' },
})
