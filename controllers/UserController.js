const { User, Token } = require('../models') // <-- Importamos Token
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const UserController = {
  // Registrar un nuevo usuario
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body


const registrar = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const userExistente = await User.findOne({ where: { email } });
    if (userExistente) {
      return res.status(409).json({ error: 'El email ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ mensaje: 'Usuario creado correctamente', userId: nuevoUsuario.id });
  } catch (err) {
    console.error('Error en registrar:', err); 
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: usuario.id, role: usuario.role }, SECRET, { expiresIn: '1h' });
    res.json({ mensaje: 'Login exitoso', token });
  } catch (err) {
    res.status(500).json({ error: 'Error en el login' });
  }
};


const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role'],
      include: {
        model: Pedidos,
        as: 'pedidos',
        include: {
          model: Producto,
          through: { attributes: ['cantidad'] }
        }
      }

      const newUser = await User.create({ name, email, password, role })
      res.status(201).json({
        message: 'Usuario registrado con éxito',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      })
    } catch (error) {
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message })
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ where: { email } })
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' })
      }

      const passwordValida = await bcrypt.compare(password, user.password)
      if (!passwordValida) {
        return res.status(401).json({ message: 'Contraseña incorrecta' })
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        'secreto123',
        { expiresIn: '1h' }
      )

      // Guardamos el token en la tabla Tokens
      await Token.create({ userId: user.id, token })

      res.json({ message: 'Login exitoso', token })
    } catch (error) {
      res.status(500).json({ message: 'Error en login', error: error.message })
    }
  },

  // Obtener todos los usuarios
  async getAll(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'createdAt']
      })
      res.json(users)
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios', error: error.message })
    }
  },

    // Logout
   async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1]

      if (!token) {
        return res.status(400).json({ message: 'Token no proporcionado' })
      }

      const deleted = await Token.destroy({ where: { token } })

      if (deleted) {
        res.json({ message: 'Sesión cerrada correctamente' })
      } else {
        res.status(404).json({ message: 'Token no encontrado o ya eliminado' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Error al cerrar sesión', error: error.message })
    }
  },
  async profile(req, res) {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: ['id', 'name', 'email', 'role'],
        include: [
          {
            association: 'pedidos',
            include: {
           association: 'productos'
          }
        }
      ]
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message })
  }
}

}

module.exports = UserController
