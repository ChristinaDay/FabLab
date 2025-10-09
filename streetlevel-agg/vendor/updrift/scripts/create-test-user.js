const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...')
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@updrift.me' }
    })

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email)
      return existingUser
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('testpass123', 12)

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@updrift.me',
        password: hashedPassword,
        name: 'Test User',
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })

    console.log('✅ Test user created successfully:', user)
    console.log('📧 Email: test@updrift.me')
    console.log('🔑 Password: testpass123')
    
    return user
  } catch (error) {
    console.error('❌ Error creating test user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
  .then(() => {
    console.log('🎉 Test user setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }) 