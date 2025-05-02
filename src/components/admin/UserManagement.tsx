
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createUser } from "@/lib/auth";
import { UserRole, Permission } from "@/lib/types";
import { SectorPhoneManagement } from "@/components/admin/SectorPhoneManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const UserManagement = () => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  
  const [permissions, setPermissions] = useState<Permission>({
    view: true,
    edit: false,
    delete: false,
    create: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser = createUser(username, password, role, permissions);
    
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
      
      setOpen(false);
    } else {
      toast({
        title: "Erro ao criar usuário",
        description: "Este nome de usuário já está em uso",
        variant: "destructive",
      });
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
                    <Button type="submit">Criar Usuário</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
        
        <TabsContent value="numbers" className="pt-4">
          <SectorPhoneManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
