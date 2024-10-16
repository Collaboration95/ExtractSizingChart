// controllers/imageController.js

export const uploadImages = async (selectedFiles, addNotification) => {
    const formData = new FormData();
  
    // Append all selected files to FormData
    selectedFiles.forEach((file) => {
      formData.append("images", file); // 'images' is the key for sending multiple files
    });
  
    try {
      const response = await fetch("api/upload/", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        addNotification("Images uploaded successfully", "success");
        const data = await response.json();
        return data;
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      addNotification("Error uploading images", "error");
      throw error;
    }
  };
  