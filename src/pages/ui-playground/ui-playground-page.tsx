import { useState, type ReactNode } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
  Input,
  Label,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  PageContainer,
  Pagination,
  Select,
  Spinner,
  Textarea,
} from "../../components/ui";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </section>
  );
}

function UiPlaygroundPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState(false);

  return (
    <PageContainer className="py-8">
      <div className="space-y-10">
        <header className="space-y-3">
          <Badge variant="primary">UI Playground</Badge>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Sistema de componentes
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Página de prueba manual para validar apariencia, comportamiento,
              estados, accesibilidad y responsive de los componentes
              reutilizables del template.
            </p>
          </div>
        </header>

        <Section
          title="Buttons"
          description="Variantes, tamaños, estados y loading."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>

            <Button variant="secondary">Secondary</Button>

            <Button variant="outline">Outline</Button>

            <Button variant="ghost">Ghost</Button>

            <Button variant="destructive">Destructive</Button>

            <Button size="sm">Small</Button>

            <Button size="lg">Large</Button>

            <Button loading>Guardando</Button>

            <Button disabled>Disabled</Button>
          </div>

          <div className="mt-4 max-w-sm">
            <Button fullWidth>Full width</Button>
          </div>
        </Section>

        <Section title="Alerts" description="Mensajes informativos y estados.">
          <div className="space-y-3">
            <Alert>Default alert.</Alert>

            <Alert variant="success">Operación completada correctamente.</Alert>

            <Alert variant="warning">Esta acción requiere atención.</Alert>

            <Alert variant="info">Información adicional para el usuario.</Alert>

            <Alert variant="destructive">
              Ocurrió un error al realizar la operación.
            </Alert>
          </div>
        </Section>

        <Section title="Badges" description="Estados compactos y etiquetas.">
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        <Section title="Card" description="Composición básica de una tarjeta.">
          <Card>
            <CardHeader>
              <CardTitle>Ejemplo de Card</CardTitle>

              <CardDescription>
                Una tarjeta reutilizable para contenido de cualquier dominio.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm">
                El contenido puede contener formularios, tablas, información,
                acciones o cualquier otro componente.
              </p>
            </CardContent>

            <CardFooter>
              <Button size="sm">Acción</Button>
            </CardFooter>
          </Card>
        </Section>

        <Section
          title="Form controls"
          description="Inputs, labels, select, textarea y checkbox."
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="playground-name">Nombre</Label>

              <Input id="playground-name" placeholder="Escribe tu nombre" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playground-email">Email con error</Label>

              <Input
                id="playground-email"
                type="email"
                error
                defaultValue="email-invalido"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playground-select">Select</Label>

              <Select id="playground-select" defaultValue="">
                <option value="" disabled>
                  Selecciona una opción
                </option>

                <option value="one">Opción 1</option>

                <option value="two">Opción 2</option>

                <option value="three">Opción 3</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="playground-disabled">Disabled</Label>

              <Input
                id="playground-disabled"
                disabled
                placeholder="Campo deshabilitado"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="playground-description">Descripción</Label>

              <Textarea
                id="playground-description"
                placeholder="Escribe una descripción..."
                rows={4}
              />
            </div>

            <label className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
              />

              <span>Acepto los términos y condiciones.</span>
            </label>
          </div>
        </Section>

        <Section title="Spinner" description="Indicadores de carga.">
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
        </Section>

        <Section title="Pagination" description="Navegación entre páginas.">
          <Pagination page={page} totalPages={10} onPageChange={setPage} />

          <p className="mt-4 text-sm text-muted-foreground">
            Página actual: {page}
          </p>
        </Section>

        <Section
          title="Dropdown"
          description="Menú de acciones y navegación por teclado."
        >
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="outline">Opciones</Button>
            </DropdownTrigger>

            <DropdownContent>
              <DropdownItem onClick={() => console.log("Editar")}>
                Editar
              </DropdownItem>

              <DropdownItem onClick={() => console.log("Duplicar")}>
                Duplicar
              </DropdownItem>

              <DropdownSeparator />

              <DropdownItem destructive onClick={() => console.log("Eliminar")}>
                Eliminar
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </Section>

        <Section
          title="Modal"
          description="Diálogo, backdrop, Escape y focus trap."
        >
          <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <ModalHeader>
              <ModalTitle>Modal de prueba</ModalTitle>

              <ModalDescription>
                Este modal sirve para comprobar accesibilidad, foco, Escape y
                cierre mediante backdrop.
              </ModalDescription>
            </ModalHeader>

            <ModalContent>
              <div className="space-y-4">
                <p className="text-sm">
                  Prueba navegar con Tab, Shift + Tab y Escape.
                </p>

                <Input placeholder="Campo dentro del modal" />
              </div>
            </ModalContent>

            <ModalFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>

              <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
            </ModalFooter>
          </Modal>
        </Section>
      </div>
    </PageContainer>
  );
}

export default UiPlaygroundPage;
