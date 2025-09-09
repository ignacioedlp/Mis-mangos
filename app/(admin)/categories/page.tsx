import { listCategories, listSubcategories } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderPlus } from "lucide-react"
import { CreateCategoryDialog } from "@/components/category-dialog"
import { CreateSubcategoryDialog } from "@/components/subcategory-dialog"
import { CategoriesTable } from "@/components/tables/categories-table"
import { SubcategoriesTable } from "@/components/tables/subcategories-table"

async function CategoriesData() {
  const [categories, subcategories] = await Promise.all([
    listCategories(),
    listSubcategories(),
  ])
  
  // Group subcategories by category
  const categoriesWithSubcategories = categories.map(cat => ({
    ...cat,
    subcategories: subcategories.filter(sub => sub.categoryId === cat.id)
  }))
  
  return { categories: categoriesWithSubcategories, subcategories }
}

export default async function CategoriesPage() {
  const { categories, subcategories } = await CategoriesData()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Categorias y subcategorias</h2>
        <p className="text-muted-foreground">Organiza tus gastos con categorías y subcategorías</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5" />
                  Categorías
                </CardTitle>
                <CardDescription>Categorías principales de gastos</CardDescription>
              </div>
              <CreateCategoryDialog />
            </div>
          </CardHeader>
          <CardContent>
            <CategoriesTable
              data={categories}
              emptyMessage="No hay categorías aún. Crea tu primera categoría para comenzar"
              emptyIcon={<FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />}
            />
          </CardContent>
        </Card>

        {/* Subcategories Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subcategorías</CardTitle>
                <CardDescription>Subcategorías de gastos detalladas</CardDescription>
              </div>
              <CreateSubcategoryDialog categories={categories} />
            </div>
          </CardHeader>
          <CardContent>
            <SubcategoriesTable
              data={subcategories}
              categories={categories}
              emptyMessage="Aun no hay subcategorías. Crea tu primera subcategoría para comenzar"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


