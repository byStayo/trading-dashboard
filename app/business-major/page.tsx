import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Clock, Award, BarChart2, GraduationCap, Users, FileText } from "lucide-react"

export default function BusinessMajorPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Accelerated Business Major Program</h1>

      <Card>
        <CardHeader>
          <CardTitle>Program Overview</CardTitle>
          <CardDescription>
            Complete your business major in 1-2 years with our accelerated, asynchronous program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Our innovative program allows you to complete a full business major at your own pace, with the potential to
            finish in just 1-2 years instead of the traditional 3-4 year timeline.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Flexible, self-paced learning</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Comprehensive curriculum</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Accredited degree program</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <span>Industry-relevant skills</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>Career-focused education</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Networking opportunities</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Program Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Total Credits</span>
              <Badge>120</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Core Business Courses</span>
              <Badge>15</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Specializations Available</span>
              <Badge>5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Minimum Completion Time</span>
              <Badge>12 months</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Maximum Completion Time</span>
              <Badge>24 months</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Ready to accelerate your business education? Follow these steps to begin:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Review the course catalog</li>
              <li>Create your personalized learning plan</li>
              <li>Enroll in your first set of courses</li>
              <li>Start learning at your own pace</li>
            </ol>
            <div className="flex justify-between mt-4">
              <Button asChild>
                <Link href="/business-major/courses">View Course Catalog</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/business-major/dashboard">Student Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Structure</CardTitle>
          <CardDescription>Understanding the components of your business major</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Core Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Foundational business knowledge and skills</p>
                <FileText className="h-12 w-12 text-primary mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Focus areas for in-depth expertise</p>
                <BarChart2 className="h-12 w-12 text-primary mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Electives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Customize your learning experience</p>
                <BookOpen className="h-12 w-12 text-primary mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Capstone Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Apply your knowledge to real-world scenarios</p>
                <Award className="h-12 w-12 text-primary mt-2" />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

