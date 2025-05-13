CREATE PROCEDURE usp_AutenticarUsuario
    @Username VARCHAR(100),
    @Password VARCHAR(100) -- Em produção, deveria ser um hash
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar se o usuário existe e a senha confere
    SELECT 
        u.id AS user_id,
        u.username,
        u.role,
        p.view,
        p.edit,
        p.delete,
        p.can_create
    FROM 
        usuarios u
    LEFT JOIN 
        permissoes p ON u.id = p.usuario_id
    WHERE 
        u.username = @Username AND u.password = @Password;
END;
