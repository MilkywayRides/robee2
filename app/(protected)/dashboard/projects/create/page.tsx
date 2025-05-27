"use client"

import CreateProjectForm from "./create-project-form"

export default function CreateProjectPage() {
  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Project</h1>
        <p className="text-muted-foreground">
          Create a new project and upload your files.
        </p>
      </div>
      
      <div className="border rounded-lg p-4">
        <CreateProjectForm />
      </div>
    </div>
  )
}