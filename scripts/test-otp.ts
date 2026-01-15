import { prisma } from '@/lib/db';
import { createAndSendOTP, verifyOTP } from '@/lib/otp';

/**
 * Test OTP functionality
 * Run this manually to debug OTP issues
 */

async function testOTP() {
  const testEmail = 'test@example.com';

  console.log('\n=== OTP TEST ===\n');

  try {
    // Step 1: Test database connection
    console.log('1. Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`   ✓ Database connected. Users: ${userCount}`);

    // Step 2: Test OTP table
    console.log('\n2. Testing OTP table...');
    const otpCount = await prisma.otp.count();
    console.log(`   ✓ OTP table exists. Total OTPs: ${otpCount}`);

    // Step 3: Create test OTP
    console.log(`\n3. Creating OTP for ${testEmail}...`);
    const otpId = await createAndSendOTP(testEmail, 'signup');
    
    if (!otpId) {
      console.log('   ✗ Failed to create OTP');
      return;
    }
    
    console.log(`   ✓ OTP created successfully`);

    // Step 4: Check OTP in database
    console.log('\n4. Checking OTP in database...');
    const otpRecord = await prisma.otp.findUnique({
      where: { id: otpId },
    });

    if (!otpRecord) {
      console.log('   ✗ OTP not found in database');
      return;
    }

    console.log(`   ✓ OTP found in database:`);
    console.log(`     Email: ${otpRecord.email}`);
    console.log(`     Code: ${otpRecord.code}`);
    console.log(`     Purpose: ${otpRecord.purpose}`);
    console.log(`     Is Used: ${otpRecord.is_used}`);
    console.log(`     Expires At: ${otpRecord.expires_at}`);

    // Step 5: Test OTP verification
    console.log(`\n5. Testing OTP verification...`);
    const isValid = await verifyOTP(testEmail, otpRecord.code, 'signup');
    console.log(`   ✓ OTP verified: ${isValid}`);

    // Step 6: Check if marked as used
    console.log('\n6. Checking if OTP marked as used...');
    const updatedOtp = await prisma.otp.findUnique({
      where: { id: otpId },
    });
    console.log(`   ✓ Is Used: ${updatedOtp?.is_used}`);

    console.log('\n=== TEST COMPLETE ===\n');
    console.log('✓ OTP system is working correctly!');
  } catch (error) {
    console.error('\n✗ TEST FAILED:\n', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testOTP();


