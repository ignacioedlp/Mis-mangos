import { listCategories, listSubcategories } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderPlus } from "lucide-react"
import { AdminPageHeader } from "@/components/admin-page-header"
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
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Organización"
        title="Categorías y subcategorías"
        description="Organiza tus gastos con categorías consistentes y subcategorías detalladas."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories Card */}
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-serif text-lg font-bold">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                    <FolderPlus className="h-4 w-4 text-primary" />
                  </div>
                  Categorías
                </CardTitle>
                <CardDescription className="mt-1">Categorías principales de gastos</CardDescription>
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
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg font-bold tracking-normal">Subcategorías</CardTitle>
                <CardDescription className="mt-1">Subcategorías de gastos detalladas</CardDescription>
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


