// src/components/CreateCourse.tsx
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Video,
  Image,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../hooks/Auth";
import type { AppPage } from "../types/Auth";
import type { CreateCoursePayload, CourseMaterial } from "../types/course";
import { courseAPI } from "../services/courseAPI";

interface CreateCourseProps {
  onNavigate: (page: AppPage) => void;
  params?: { courseId?: string; mode?: "create" | "edit" };
}

export const CreateCourse: React.FC<CreateCourseProps> = ({
  onNavigate,
  params,
}) => {
  const { user } = useAuth();
  const isEditing = params?.mode === "edit" && params?.courseId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "", // string for controlled input
    category: "",
    max_students: "", // string for controlled input
    thumbnail_url: "",
  });

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingMaterials, setUploadingMaterials] = useState(false);
  const [error, setError] = useState("");
  const [courseId, setCourseId] = useState(params?.courseId || "");

  const categories = [
    "Programming",
    "Design",
    "Business",
    "Marketing",
    "Photography",
    "Music",
  ];

  useEffect(() => {
    if (isEditing && params?.courseId) {
      loadCourseData(params.courseId);
    }
  }, [isEditing, params?.courseId]);

  const loadCourseData = async (id: string) => {
    try {
      setLoading(true);
      const courseData = await courseAPI.getCourseById(id);
      const materialsData = await courseAPI.getCourseMaterials(id);

      setFormData({
        title: courseData.course.title,
        description: courseData.course.description,
        price: courseData.course.price.toString(),
        category: courseData.course.category,
        max_students: courseData.course.max_students.toString(),
        thumbnail_url: courseData.course.thumbnail_url || "",
      });

      setMaterials(materialsData.materials);
    } catch (error) {
      console.error("Error loading course data:", error);
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: CreateCoursePayload = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        currency: "USD",
        category: formData.category,
        max_students: parseInt(formData.max_students, 10) || 0,
        thumbnail_url: formData.thumbnail_url,
      };

      let result;
      if (isEditing && courseId) {
        result = await courseAPI.updateCourse(courseId, payload);
      } else {
        result = await courseAPI.createCourse(payload);
        setCourseId(result.course.id);
      }

      alert(
        isEditing
          ? "Course updated successfully!"
          : "Course created successfully!"
      );
      onNavigate("instructor-dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !courseId) {
      alert("Please select files and ensure the course is saved first");
      return;
    }

    try {
      setUploadingMaterials(true);
      await courseAPI.uploadMaterials(courseId, selectedFiles);
      const materialsData = await courseAPI.getCourseMaterials(courseId);
      setMaterials(materialsData.materials);
      setSelectedFiles(null);
      alert("Materials uploaded successfully!");
    } catch (error) {
      console.error("Error uploading materials:", error);
      alert("Failed to upload materials. Please try again.");
    } finally {
      setUploadingMaterials(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm("Are you sure you want to delete this material?"))
      return;

    try {
      await courseAPI.deleteMaterial(courseId, materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      alert("Material deleted successfully!");
    } catch (error) {
      console.error("Error deleting material:", error);
      alert("Failed to delete material. Please try again.");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("video/"))
      return <Video className="h-5 w-5 text-blue-500" />;
    if (fileType.startsWith("image/"))
      return <Image className="h-5 w-5 text-green-500" />;
    return <FileText className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => onNavigate("instructor-dashboard")}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                {isEditing ? "Edit Course" : "Create Course"}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? "Edit Course Details" : "Course Information"}
            </h3>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category *
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description *
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your course..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="max_students"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Max Students
                  </label>
                  <input
                    type="number"
                    name="max_students"
                    id="max_students"
                    min="1"
                    required
                    value={formData.max_students}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="thumbnail_url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  name="thumbnail_url"
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => onNavigate("instructor-dashboard")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Course"
                    : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {(isEditing || courseId) && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Course Materials
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Materials
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          accept=".pdf,.mp4,.mov,.avi,.ppt,.pptx,.jpg,.jpeg,.png"
                          className="sr-only"
                          onChange={(e) => setSelectedFiles(e.target.files)}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, videos, images, presentations up to 500MB each
                    </p>
                  </div>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Selected Files ({selectedFiles.length}):
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {Array.from(selectedFiles).map((file, index) => (
                          <li key={index} className="flex items-center">
                            {getFileIcon(file.type)}
                            <span className="ml-2">{file.name}</span>
                            <span className="ml-auto text-gray-400">
                              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={handleFileUpload}
                      disabled={uploadingMaterials}
                      className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                    >
                      {uploadingMaterials ? "Uploading..." : "Upload Materials"}
                    </button>
                  </div>
                )}
              </div>

              {materials.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Uploaded Materials
                  </h4>
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                      >
                        <div className="flex items-center">
                          {getFileIcon(material.file_type)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {material.original_filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(material.file_size / (1024 * 1024)).toFixed(2)}{" "}
                              MB • Uploaded{" "}
                              {new Date(
                                material.upload_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
