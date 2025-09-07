import { listCategories, listSubcategories } from "@/actions/expense-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FolderPlus, Percent } from "lucide-react"
import { CreateCategoryDialog } from "@/components/category-dialog"
import { CreateSubcategoryDialog } from "@/components/subcategory-dialog"
import { EditCategoryDialog } from "@/components/edit-category-dialog"
import { DeleteCategoryButton } from "@/components/delete-category-button"
import { DeleteSubcategoryButton } from "@/components/delete-subcategory-button"

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
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No categories yet</p>
                <p className="text-sm">Create your first category to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-24">Budget %</TableHead>
                    <TableHead className="w-20">Subcategories</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        {category.budgetPercentage ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {category.budgetPercentage}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category.subcategories.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <EditCategoryDialog category={category} />
                          <DeleteCategoryButton 
                            categoryId={category.id} 
                            categoryName={category.name} 
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
            {subcategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No subcategories yet</p>
                <p className="text-sm">Create categories first, then add subcategories</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((subcategory) => {
                    const parentCategory = categories.find(c => c.id === subcategory.categoryId)
                    return (
                      <TableRow key={subcategory.id}>
                        <TableCell className="font-medium">{subcategory.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {parentCategory?.name || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DeleteSubcategoryButton 
                            subcategoryId={subcategory.id} 
                            subcategoryName={subcategory.name} 
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


