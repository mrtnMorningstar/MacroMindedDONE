import { Metadata } from "next";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Try to find post by slug
    const postsRef = collection(db, "blog");
    const q = query(postsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    let postData: any = null;

    if (!querySnapshot.empty) {
      postData = querySnapshot.docs[0].data();
    } else {
      // Fallback: try to get by document ID
      const docRef = doc(db, "blog", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        postData = docSnap.data();
      }
    }

    if (!postData) {
      return {
        title: "Post Not Found - MacroMinded Blog",
        description: "The article you're looking for doesn't exist.",
      };
    }

    return {
      title: `${postData.title} - MacroMinded Blog`,
      description: postData.description || postData.content?.substring(0, 160) || "Read this article on MacroMinded",
      openGraph: {
        title: postData.title,
        description: postData.description || postData.content?.substring(0, 160),
        images: postData.thumbnail ? [postData.thumbnail] : [],
        type: "article",
        publishedTime: postData.date,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Blog Post - MacroMinded",
      description: "Read articles on MacroMinded",
    };
  }
}

