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
        <h2 className="text-3xl font-bold tracking-tight">Categories & Subcategories</h2>
        <p className="text-muted-foreground">Organize your expenses with categories and subcategories</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5" />
                  Categories
                </CardTitle>
                <CardDescription>Main expense categories</CardDescription>
              </div>
              <CreateCategoryDialog />
            </div>
          </CardHeader>
          <CardContent>
            <CategoriesTable
              data={categories}
              emptyMessage="No categories yet. Create your first category to get started"
              emptyIcon={<FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />}
            />
          </CardContent>
        </Card>

        {/* Subcategories Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subcategories</CardTitle>
                <CardDescription>Detailed expense subcategories</CardDescription>
              </div>
              <CreateSubcategoryDialog categories={categories} />
            </div>
          </CardHeader>
          <CardContent>
            <SubcategoriesTable
              data={subcategories}
              categories={categories}
              emptyMessage="No subcategories yet. Create categories first, then add subcategories"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


