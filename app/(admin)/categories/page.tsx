import { listCategories, listSubcategories } from "@/actions/expense-actions"
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
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Organización"
        title="Categorías y subcategorías"
        description="Organiza tus gastos con categorías consistentes y subcategorías detalladas."
      />

      <section className="ledger-section grid lg:grid-cols-2">
        <div className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-serif text-lg font-bold">Categorías</h2>
              <p className="mt-1 text-sm text-muted-foreground">Grupos principales de gastos</p>
            </div>
            <CreateCategoryDialog />
          </div>
            <CategoriesTable
              data={categories}
              emptyMessage="No hay categorías aún. Crea tu primera categoría para comenzar"
              emptyIcon={<FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />}
            />
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-serif text-lg font-bold">Subcategorías</h2>
              <p className="mt-1 text-sm text-muted-foreground">Detalle dentro de cada categoría</p>
            </div>
            <CreateSubcategoryDialog categories={categories} />
          </div>
            <SubcategoriesTable
              data={subcategories}
              categories={categories}
              emptyMessage="Aun no hay subcategorías. Crea tu primera subcategoría para comenzar"
            />
        </div>
      </section>
    </div>
  )
}
