using App_Code;
using BlogEngine.Core;
using BlogEngine.Core.API.BlogML;
using BlogEngine.Core.Providers;
using System;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

public class UploadController : ApiController
{
    public HttpResponseMessage Post(string action)
    {
        WebUtils.CheckRightsForAdminPostPages(false);

        HttpPostedFile file = HttpContext.Current.Request.Files[0];
        action = action.ToLower();

        if (file != null && file.ContentLength > 0)
        {
            var dirName = string.Format("/{0}/{1}", DateTime.Now.ToString("yyyy"), DateTime.Now.ToString("MM"));
            var dir = BlogService.GetDirectory(dirName);
            var retUrl = "";

            if (action == "import")
            {
                if (Security.IsAdministrator)
                {
                    return ImportBlogML();
                }
            } 
            if (action == "profile")
            {
                if (Security.IsAuthorizedTo(Rights.EditOwnUser))
                {
                    // upload profile image
                    dir = BlogService.GetDirectory("/avatars");
                    var dot = file.FileName.IndexOf(".");
                    var ext = dot > 0 ? file.FileName.Substring(dot) : "";
                    var fileName = User.Identity.Name + ext;

                    var imgPath = HttpContext.Current.Server.MapPath(dir.FullPath + "/" + fileName);
                    var image = Image.FromStream(file.InputStream);
                    Image thumb = image.GetThumbnailImage(80, 80, () => false, IntPtr.Zero);
                    thumb.Save(imgPath);

                    return Request.CreateResponse(HttpStatusCode.Created, fileName);
                }
            }
            if (action == "image")
            {
                if (Security.IsAuthorizedTo(Rights.EditOwnPosts))
                {
                    var uploaded = BlogService.UploadFile(file.InputStream, file.FileName, dir, true);
                    return Request.CreateResponse(HttpStatusCode.Created, uploaded.FileDownloadPath);
                }
            }
            if (action == "file")
            {
                if (Security.IsAuthorizedTo(Rights.EditOwnPosts)) 
                {
                    var uploaded = BlogService.UploadFile(file.InputStream, file.FileName, dir, true);
                    retUrl = uploaded.FileDownloadPath + "|" + file.FileName + " (" + BytesToString(uploaded.FileSize) + ")";
                    return Request.CreateResponse(HttpStatusCode.Created, retUrl);
                }
            }
            if (action == "video")
            {
                if (Security.IsAuthorizedTo(Rights.EditOwnPosts))
                {
                    // default media folder
                    var mediaFolder = "media";

                    // get the mediaplayer extension and use it's folder
                    var mediaPlayerExtension = BlogEngine.Core.Web.Extensions.ExtensionManager.GetExtension("MediaElementPlayer");
                    mediaFolder = mediaPlayerExtension.Settings[0].GetSingleValue("folder");

                    var folder = Utils.ApplicationRelativeWebRoot + mediaFolder + "/";
                    var fileName = file.FileName;

                    UploadVideo(folder, file, fileName);

                    return Request.CreateResponse(HttpStatusCode.Created, fileName);
                }
            }
        }
        return Request.CreateResponse(HttpStatusCode.BadRequest);
    }

    #region Private methods

    HttpResponseMessage ImportBlogML()
    {
        HttpPostedFile file = HttpContext.Current.Request.Files[0];
        if (file != null && file.ContentLength > 0)
        {
            var reader = new BlogReader();
            var rdr = new StreamReader(file.InputStream);
            reader.XmlData = rdr.ReadToEnd();

            if (reader.Import())
            {
                return Request.CreateResponse(HttpStatusCode.OK);
            }
        }
        return Request.CreateResponse(HttpStatusCode.InternalServerError);
    }

    static String BytesToString(long byteCount)
    {
        string[] suf = { "B", "KB", "MB", "GB", "TB", "PB", "EB" };
        if (byteCount == 0)
            return "0" + suf[0];
        long bytes = Math.Abs(byteCount);
        int place = Convert.ToInt32(Math.Floor(Math.Log(bytes, 1024)));
        double num = Math.Round(bytes / Math.Pow(1024, place), 1);
        return (Math.Sign(byteCount) * num).ToString() + suf[place];
    }

    private void UploadVideo(string virtualFolder, HttpPostedFile file, string fileName)
    {
        var folder = HttpContext.Current.Server.MapPath(virtualFolder);
        if (!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }
        file.SaveAs(folder + fileName);
    }

    #endregion
}