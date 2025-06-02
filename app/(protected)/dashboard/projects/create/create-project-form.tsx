"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox" // Import Checkbox
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Upload, FolderUp } from "lucide-react"

// Refined Schema with conditional validation for price
const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project description is required"),
  visibility: z.enum(["public", "private"]),
  isPaid: z.boolean().default(false),
  price: z.number().positive("Price must be positive").optional(), // Price should be positive if provided
}).superRefine((data, ctx) => {
  // If isPaid is true, price must be defined and positive
  if (data.isPaid) {
    if (data.price === undefined || data.price === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"], // Target the price field
        message: "Price is required for paid projects",
      });
    } else if (data.price <= 0) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"], // Target the price field
        message: "Price must be a positive number",
      });
    }
  }
});


type FormValues = z.infer<typeof formSchema>

// Keep FileWithPath interface if needed for webkitRelativePath
interface FileWithPath extends File {
  webkitRelativePath: string;
}

function CreateProjectForm() {
  const router = useRouter()
  const [files, setFiles] = useState<FileWithPath[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
      isPaid: false,
      price: undefined, // Default to undefined
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Combine new files with existing ones if needed, or replace
      // For simplicity, this replaces existing files
      setFiles(Array.from(e.target.files) as FileWithPath[])
    }
  }

  const getFolderStructure = (files: FileWithPath[]) => {
    const structure: { [key: string]: number } = {}
    files.forEach((file) => {
      // Use webkitRelativePath if available, otherwise treat as root file
      const path = file.webkitRelativePath || file.name;
      const parts = path.split('/');
      // If path has slashes, first part is folder name, otherwise 'root'
      const folder = parts.length > 1 ? parts[0] : 'root';
      structure[folder] = (structure[folder] || 0) + 1;
    })
    return structure
  }

  const onSubmit = async (values: FormValues) => {
    setUploading(true)
    setUploadProgress(0) // Reset progress on new submission

    try {
      // --- Data to send to the backend ---
      // REMOVED: userId (should be handled by backend session)
      // REMOVED: createdAt, updatedAt (should be set by backend)
      const projectData = {
        name: values.name,
        description: values.description,
        visibility: values.visibility,
        isPaid: values.isPaid,
        // Send price only if isPaid is true, otherwise let backend handle default/null
        price: values.isPaid ? values.price : undefined,
      }

      console.log("Submitting Project Data:", projectData); // Log data being sent

      // --- Create Project ---
      const projectResponse = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!projectResponse.ok) {
        let errorText = "Failed to create project.";
        try {
          // Try to parse backend error message if available
          const errorJson = await projectResponse.json();
          errorText = errorJson.message || errorJson.error || projectResponse.statusText;
        } catch (e) {
           // If response is not JSON, use status text
           errorText = projectResponse.statusText;
        }
        console.error("Project creation API error response:", projectResponse.status, errorText);
        throw new Error(`Project creation failed: ${errorText}`); // Throw more specific error
      }

      const project = await projectResponse.json()
      console.log("Project Created:", project);

      // --- Upload Files (if any) ---
      if (files.length > 0 && project.id) { // Ensure project.id exists
        const totalFiles = files.length
        let uploadedFiles = 0

        console.log(`Starting upload of ${totalFiles} files for project ${project.id}`);

        for (const file of files) {
          const formData = new FormData()
          formData.append("projectId", project.id) // Use the ID from the created project
          formData.append("file", file)
          // Send relative path if available (for folders), otherwise just filename
          formData.append("path", file.webkitRelativePath || file.name)

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
            // Note: Do NOT set Content-Type header when using FormData,
            // the browser sets it correctly with the boundary.
          })

          if (!uploadResponse.ok) {
            let uploadErrorText = `Failed to upload file: ${file.name}`;
             try {
                const errorJson = await uploadResponse.json();
                uploadErrorText = errorJson.message || errorJson.error || uploadResponse.statusText;
             } catch (e) {
                uploadErrorText = uploadResponse.statusText;
             }
            console.error("File upload API error response:", uploadResponse.status, uploadErrorText);
            // Decide if you want to stop all uploads on first failure or continue
            // Throwing here will stop the process
            throw new Error(uploadErrorText)
          }

          uploadedFiles++
          setUploadProgress(Math.round((uploadedFiles / totalFiles) * 100))
        }
         console.log("File upload completed.");
      } else {
         console.log("No files selected for upload or project ID missing.");
      }

      toast.success("Project created successfully!")
      // Navigate to the dashboard or the newly created project page
      router.push(`/dashboard/projects`) // Or `/dashboard/projects/${project.id}`
      router.refresh() // Refresh server components data if needed

    } catch (error) {
      console.error("onSubmit Error:", error) // Log the specific error caught
      // Display the error message from the caught error
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred.")
    } finally {
      setUploading(false)
      // Optionally reset files state here if desired after submission
      // setFiles([]);
      // setUploadProgress(0); // Already reset in finally, but good practice
    }
  }

  return (
    <Form {...form}>
      {/* Add novalidate to prevent default browser validation, rely on RHF/Zod */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Project" {...field} />
              </FormControl>
              <FormDescription>
                This is your project&apos;s display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value} // Ensure value is controlled
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Control who can see your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Using shadcn Checkbox */}
        <FormField
          control={form.control}
          name="isPaid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
               <FormControl>
                 <Checkbox
                   checked={field.value}
                   onCheckedChange={field.onChange} // Use onCheckedChange for shadcn Checkbox
                   id="isPaidCheckbox" // Add id for label association
                 />
               </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="isPaidCheckbox"> {/* Associate label with checkbox */}
                   Paid Project
                </FormLabel>
                <FormDescription>
                  Enable if users need to pay to access or purchase this project.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Conditional Price Field */}
        {form.watch("isPaid") && (
          <FormField
            control={form.control}
            name="price"
            render={({ field: { value, onChange, ...fieldProps } }) => ( // Destructure field correctly
              <FormItem>
                <FormLabel>Price (USD)</FormLabel> {/* Specify currency if applicable */}
                <FormControl>
                  <Input
                    type="number"
                    step="0.01" // Allow cents
                    min="0.01" // Price should be positive if required
                    placeholder="e.g., 29.99"
                    // Use field value directly (controlled by RHF). Handle parsing in onChange.
                    value={value ?? ""} // Use ?? "" to handle undefined/null for empty input display
                    onChange={(e) => {
                      const val = e.target.value;
                      // Pass number or undefined to RHF
                      onChange(val === "" ? undefined : parseFloat(val));
                    }}
                    {...fieldProps} // Spread remaining field props like name, ref, onBlur
                  />
                </FormControl>
                <FormDescription>
                  Set the price for your project. Required if &apos;Paid Project&apos; is enabled.
                </FormDescription>
                <FormMessage /> {/* Displays Zod validation errors */}
              </FormItem>
            )}
          />
        )}

        {/* File and Folder Upload */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Single/Multiple File Upload */}
            <div>
              <FormLabel htmlFor="file-upload">Files</FormLabel>
              <FormDescription className="mb-2">
                Upload individual files.
              </FormDescription>
              <FormControl>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="cursor-pointer" // Improve UX
                    disabled={uploading}
                  />
              </FormControl>
               <FormMessage /> {/* Add FormMessage for potential file errors if needed */}
            </div>

            {/* Folder Upload */}
            <div>
              <FormLabel htmlFor="folder-upload">Folders</FormLabel>
              <FormDescription className="mb-2">
                Upload entire folders (browser support varies).
              </FormDescription>
               <FormControl>
                  <Input
                    id="folder-upload"
                    type="file"
                    // @ts-ignore - webkitdirectory is non-standard but widely used
                    webkitdirectory=""
                    directory="" // Standard attribute (less support)
                    multiple // Needed for folder uploads
                    onChange={handleFileSelect}
                    className="cursor-pointer" // Improve UX
                    disabled={uploading}
                  />
              </FormControl>
               <FormMessage /> {/* Add FormMessage for potential folder errors if needed */}
            </div>
          </div>

          {/* Display Selected Files/Folders */}
          {files.length > 0 && !uploading && ( // Hide structure during upload? Optional.
            <div className="border rounded-md p-4 space-y-2">
              <div className="text-sm font-medium">Selected items:</div>
              {Object.entries(getFolderStructure(files)).map(([folder, count]) => (
                <div key={folder} className="text-sm text-muted-foreground flex items-center">
                  <FolderUp className="w-4 h-4 mr-2 flex-shrink-0" />
                  {/* Display 'Root Files' if folder is 'root' */}
                  <span className="truncate">{folder === 'root' ? 'Root Files' : folder}: {count} item(s)</span>
                </div>
              ))}
               {/* Optionally show total file count */}
               <div className="text-sm font-semibold pt-2 border-t mt-2">
                 Total Files: {files.length}
               </div>
            </div>
          )}

          {/* Upload Progress Indicator */}
          {uploading && (
            <div className="space-y-2 pt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                {uploadProgress < 100 ? `Uploading... ${Math.round(uploadProgress)}%` : "Processing..."}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={uploading || !form.formState.isValid} className="w-full">
          {uploading ? (
            <>
              {/* More dynamic icon based on progress */}
              {uploadProgress < 100 ?
                 <Upload className="w-4 h-4 mr-2 animate-bounce" /> :
                 <div className="w-4 h-4 mr-2 border-2 border-background border-t-primary rounded-full animate-spin"></div>
              }
              {uploadProgress < 100 ? `Uploading (${Math.round(uploadProgress)}%)...` : "Finalizing..."}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Create Project
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}

export default CreateProjectForm