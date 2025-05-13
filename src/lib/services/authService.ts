const pool = await sql.connect(dbConfig);
const result = await pool
  .request()
  .input('Username', sql.VarChar, username)
  .input('Password', sql.VarChar, password)
  .execute('usp_AutenticarUsuario');

const user = result.recordset[0];
if (!user) {
  return null;
}

// Estrutura no formato esperado pela aplicação
return {
  id: user.user_id.toString(),
  username: user.username,
  role: user.role,
  permissions: {
    view: user.view,
    edit: user.edit,
    delete: user.delete,
    create: user.can_create
  }
};
