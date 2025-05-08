
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createUser } from "@/lib/auth";
import { getUsersFromSupabase } from "@/lib/userService";
import { UserRole, Permission, User } from "@/lib/types";
import { SectorPhoneManagement } from "@/components/admin/SectorPhoneManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export const UserManagement = () => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  
  const [permissions, setPermissions] = useState<Permission>({
    view: true,
    edit: false,
    delete: false,
    create: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersList = await getUsersFromSupabase();
      setUsers(usersList);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro ao buscar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const newUser = await createUser(username, password, role, permissions);
      
      if (newUser) {
        toast({
          title: "Usuário criado",
          description: `Usuário ${username} foi criado com sucesso`,
        });
        
        // Reset form
        setUsername("");
        setPassword("");
        setRole("user");
        setPermissions({
          view: true,
          edit: false,
          delete: false,
          create: false
        });
        
        // Recarregar lista de usuários
        fetchUsers();
        
        setOpen(false);
      } else {
        toast({
          title: "Erro ao criar usuário",
          description: "Este nome de usuário já está em uso",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro ao criar usuário",
        description: "Ocorreu um erro ao criar o usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePermission = (key: keyof Permission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="numbers">Números de WhatsApp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="pt-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lista de Usuários</h2>
              {currentUser?.role === "admin" && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Criar Novo Usuário</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Usuário</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Nome de Usuário</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Função</Label>
                        <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Selecione uma função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="user">Usuário</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Permissões</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="view">Visualizar</Label>
                            <Switch
                              id="view"
                              checked={permissions.view}
                              onCheckedChange={(checked) => updatePermission("view", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="edit">Editar</Label>
                            <Switch
                              id="edit"
                              checked={permissions.edit}
                              onCheckedChange={(checked) => updatePermission("edit", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="delete">Excluir</Label>
                            <Switch
                              id="delete"
                              checked={permissions.delete}
                              onCheckedChange={(checked) => updatePermission("delete", checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="create">Criar Usuários</Label>
                            <Switch
                              id="create"
                              checked={permissions.create}
                              onCheckedChange={(checked) => updatePermission("create", checked)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Criando..." : "Criar Usuário"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableCaption>Lista de usuários do sistema</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Permissões</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Carregando...</TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Nenhum usuário encontrado</TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex flex-wrap gap-1">
                            {user.permissions.view && <Badge variant="outline">Ver</Badge>}
                            {user.permissions.edit && <Badge variant="outline">Editar</Badge>}
                            {user.permissions.delete && <Badge variant="outline">Excluir</Badge>}
                            {user.permissions.create && <Badge variant="outline">Criar</Badge>}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="numbers" className="pt-4">
          <SectorPhoneManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
