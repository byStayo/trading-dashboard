import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

const courses = [
  { id: "BUS101", name: "Introduction to Business", credits: 3, level: "Beginner", duration: "4 weeks" },
  { id: "ECON201", name: "Microeconomics", credits: 3, level: "Intermediate", duration: "6 weeks" },
  { id: "ACCT301", name: "Financial Accounting", credits: 4, level: "Intermediate", duration: "8 weeks" },
  { id: "MKT401", name: "Marketing Strategy", credits: 3, level: "Advanced", duration: "6 weeks" },
  { id: "FIN501", name: "Corporate Finance", credits: 4, level: "Advanced", duration: "8 weeks" },
]

export default function CourseCatalogPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Course Catalog</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
          <CardDescription>Browse our comprehensive list of business courses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.id}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        course.level === "Beginner"
                          ? "secondary"
                          : course.level === "Intermediate"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {course.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>
                    <Button asChild size="sm">
                      <Link href={`/business-major/courses/${course.id}`}>Details</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specializations</CardTitle>
          <CardDescription>Focus your studies with one of our specialized tracks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Finance", "Marketing", "Management", "Entrepreneurship", "International Business"].map(
              (specialization) => (
                <Card key={specialization}>
                  <CardHeader>
                    <CardTitle className="text-lg">{specialization}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href={`/business-major/specializations/${specialization.toLowerCase().replace(" ", "-")}`}>
                        View Courses
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

