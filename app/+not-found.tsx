import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalization } from '@/hooks/useLocalization';
import { colors, spacing, fontSize } from '@/constants/theme';

export default function NotFoundScreen() {
  const { language, isRTL } = useLocalization();

  return (
    <>
      <Stack.Screen options={{ title: language === 'ar' ? 'خطأ!' : 'Oops!' }} />
      <View style={styles.container}>
        <Text
          style={[
            styles.text,
            {
              fontFamily: language === 'ar' ? 'Tajawal-Medium' : 'Nunito-SemiBold',
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {language === 'ar' ? 'هذه الصفحة غير موجودة.' : "This screen doesn't exist."}
        </Text>
        <Link href="/" style={styles.link}>
          <Text
            style={[
              styles.linkText,
              {
                fontFamily: language === 'ar' ? 'Tajawal-Regular' : 'Nunito-Regular',
              },
            ]}
          >
            {language === 'ar' ? 'العودة للرئيسية!' : 'Go to home screen!'}
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: '#F8FDF9',
  },
  text: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
});