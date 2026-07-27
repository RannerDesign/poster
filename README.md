[README.md](https://github.com/user-attachments/files/30434058/README.md)
# Poster Generator

**JavaScript Application for assembling multiple images into one poster**

v3.1 2026-07-30 (c) RannerDesign, MIT License

## Objective

Construction of an image file ("poster") in jpeg format, which is composed of several individual images. The individual images may have any aspect ratio. The combination is either done as a grid with a specified number of rows and columns or in the form of horizontal or vertical stripes, where the individual images are scaled to the same height or width.

## Requirements and Installation

The application may be used locally or be installed on a web server. Only the html-, js- and some image files need to be copied to the target directory. More installation is not required. A web browser with JavaScript support is required to use the application. The application has been tested with Google Chrome 125, FireFox 126 and Safari IOS 17.5, but should run on most common browsers.

The program is also available as open source at https://github.com/RannerDesign/poster/

## Acknowledgements

The following ideas and programs from other authors have been used for this application in accordance with the respective license conditions:

- **dom-to-image-more** (c) Marc Brooks, Anatolii Saienko, Paul Bakaus, MIT License, 
  https://github.com/IDisposable/dom-to-image-more
- **heic-to** (c) Hopper Gee, LGPL-3.0 License, https://github.com/hoppergee/heic-to
- **exif-reader** (c) Mattias Wallander, MPL-2.0 License, https://github.com/mattiasw/ExifReader
- Improved **Algorithm** based on a Dynamic Programming approach by fedja, 
  https://mathoverflow.net/questions/473701/

Special thanks are extended to the authors for their ideas and for developing and providing the programs.

## User Interface

#### Help

The ***Help*** button displays this program description.

#### Language

Selection of dialogue language (English or German).

### 1. Load Images

#### 1.1. Image selection via drag-and-drop or file selection

There are two options for selecting images to be used:

1. by dragging one or more images from the Explorer into the dashed outlined area
2. by clicking in this area and using the file selection dialog that opens

Using the ***Load Images*** button, all selected images are loaded immediately into the program. During the loading process, a red dot appears next to the button and the images still to be loaded are displayed.

The list of loaded images is now displayed at the bottom of the website, each with a small image and the most important metadata. In this list, individual images can be deleted (click on the wastebasket next to it) or moved to change the order. Moving is done using drag-and-drop, where you click on an image and drag it over another image while holding down the mouse button.

***Load images*** can be carried out as often as you like in order to load images in groups, or to delete individual images or change the order. Even if function ***Create*** poster has already been carried out, additional images can be loaded or existing ones removed.

As of version 3 this program also supports the HEIF file format. Since this format is not natively supported by browsers, the images must be converted to JPG, which significantly increases the time required to load them.

#### 1.2. Remove Images

The ***Remove Images*** button removes **all** loaded images. Individual images can be deleted from the list at the bottom of the page. A background image however is kept.

### 2. Select Poster Type

The application supports 3 different types ("poster type") in the structure of the poster.

These are described below, whereby the special features of some parameters from step 5 are already explained.

#### 2.1. Grid

This type of poster is particularly suitable for images that consist of uniform aspect ratios. The structure of the poster corresponds to a table with a given number of rows and columns.

![poster1cover](poster_help1cover.jpg)

The first parameters required are the **number of columns** and the **number of rows**. If the number of rows is not specified, enough rows are generated to display all the loaded images. If the number of rows and columns are specified, the poster is generated with these numbers. If the number of loaded images is not sufficient, empty spaces appear in the poster. If the number of loaded images is greater than (number of rows * number of columns), the remaining images are not included in the poster.

All individual images are displayed in a rectangle of the same size. This is determined by the **single image width** , **single image height** and **aspect ratio** (width : height). If width and height are specified, these details are decisive and any additional input for aspect ratio is ignored.

If only one value is given, i.e. width or height, the missing size is calculated using the **aspect ratio** .

Various inputs are possible for the aspect ratio:

- Decimal number (with point or comma as decimal separator)

- A width : height specification (e.g. "4:3")

- " **E** ": the aspect ratio of the first image in the loaded list is used

- " **L** ": the aspect ratio of the last image in the loaded list is used

- " **D** ": the arithmetic average of the aspect ratios of all loaded images is used

- " **M** ": the aspect ratio that occurs in most loaded images is used


If the aspect ratio is left blank, "D" is assumed.

Since the Grid poster type uses the same rectangle as space for all images, for images whose aspect ratio does not match this rectangle, you have to decide how the individual image is to be fitted into the rectangle. There are 3 crop options available for this:

**Contain**

![poster1contain](poster_help1contain.jpg)

Here the entire image is displayed while maintaining its aspect ratio, which means that the rectangle may not be completely filled and empty areas with background color appear at the top and bottom or right and left.

**Fill**

![poster1fill](poster_help1fill.jpg)

Here the entire image is displayed, whereby the aspect ratio is not maintained, but the width and height of the individual image are scaled to the size of the rectangle. This can result in considerable distortion.

**Cover**

![poster1cover](poster_help1cover.jpg)

Here, a part of the individual image is displayed while maintaining the aspect ratio. This fills the entire rectangle and at the same time avoids distortion. The crop is centered so that some of the original image may be missing on the right and left or top and bottom.

#### 2.2. Stripes Horizontal

This type of poster is well suited for images with very different aspect ratios. The images are arranged in horizontal stripes, so all images in a strip have the same height.

![poster2](poster_help2.jpg)



Portrait format images are somewhat "disadvantaged" as they have less area than landscape format images. The different strips can be of different heights as they are always scaled to make full use of the poster width.

With this type of poster, only the **total width** of the poster can be specified exactly. The **height** can only be specified approximately, as space is required for adjustment in order to scale the stripes to the poster width and the associated height change. 

However, the height can also be omitted. In this case, either the **number of horizontal stripes** must be specified or the **Images per Row**.  In the latter case a series of numbers is expected separated by commas or spaces or n * m meaning n rows with each m images. The height is then calculated.

#### 2.3. Stripes Vertical

This type of poster is also well suited for images with very different aspect ratios. The images are arranged in vertical stripes, so all images in a strip have the same width.

![poster3](poster_help3.jpg)

Landscape format images are somewhat "disadvantaged" as they have less area than portrait format images. The different stripes can be of different widths as they are always scaled to make full use of the poster height.

With this type of poster, only the **total height** of the poster can be specified exactly. The **width** can only be specified approximately, as space is required for adjustment in order to scale the stripes to poster height and the associated change in width.

However, the width can also be omitted. In this case, either the **number of vertical stripes** must be specified or the **Images per Column**.  In the latter case a series of numbers is expected separated by commas or spaces or n * m meaning n columns with each m images. The width is then calculated.

Which poster type is best for a given number of images is a matter of taste and can often only be found out by trial and error. Sometimes changing the order of the images can help to achieve a better effect.

### 3. Select Output Format

Technically, the jpeg file for the poster can be created in two different ways using this application. This seemed necessary at first because different browser versions behaved differently and a large number of images resulted in different performance issues. This behavior is no longer the case, in most cases, the two output formats produce almost exactly the same result.

Both options are nevertheless maintained in parallel, as there are still a few differences in detail, which are described below.

#### 3.1. Canvas

This output format is the standard case. It fulfills all basic functions of the application without restrictions.

#### 3.2. HTML

In addition to the basic functions, this output format also offers the magnification function and the option to save the entire file in .html format (see point 6).

### 4. Poster Parameters

This section contains all the parameters that can be used to design and influence the creation of the poster. Some parameters have already been described in section 3 because they are specific to the poster type.

The following parameters are valid for all variants:

**Poster margins:** Margin spacing of the images in pixels 
If you enter one number, this is the distance at the top, right, bottom and left. 
If you enter 2 numbers separated by commas, the first determines the margin spacing at the top and bottom and the second right and left. 
If you enter 3 numbers separated by commas, the first determines the top, the second right and left and the third bottom. 
If you enter 4 numbers separated by commas, these determine the margin spacing in the order top, right, bottom and left.

**Gap:** Distance between individual images in pixels. 
If you enter a number, this applies to both horizontal and vertical spacing. If you enter two numbers separated by a comma, the first determines the horizontal spacing and the second the vertical spacing.

**Background color:** Color choice as RGB, HSL or hex defines the background color of the entire poster.

**Background image**: Switch to activate a background image with parameter entry below.

**Image Captions**: Switch to enable image captions with parameter entry below.

For the single image the following options are available:

**Border width:** Thickness of the frame around the single image in pixels

**Border style:** There are differences depending on the output format.

In the case of **Canvas**, only one line pattern (eg for dashed lines) can be entered here. This consists of one or more numbers separated by spaces or commas. The individual numbers represent pixel values. If the number of numbers is odd, the series of numbers is appended to itself again so that there is now an even number. The numbers are then interpreted alternately as length specifications for the line and the space between the lines.

In the case of **HTML**, the frame style can be selected from a selection list. The options offered are typically used to design websites. The extent to which the more specific options are suitable for poster design can only be determined by trial and error.

**Border color:** Color selection as RGB, HSL or hex defines the color of the frame around the individual image.

**Border radius:** Rounding radius of all corners in pixels

**Poster Name:** A name for the poster window can be specified here. If empty, the name `posterX` is used, where X=1, 2 or 3 corresponds to the three poster types. When a poster is created again, the poster window is reused and overwritten. If you want to compare several poster designs without jpeg output, you can do this by giving each one a new poster name before creation. A new window is then created for each poster name.

**Image File Type**: Here, you can choose between JPG and PNG for the poster's output format. Not all operating systems support both file types. For example, only PNG is supported on iPhones and iPads. The value of this parameter is therefore preset based on the operating system.

**Quality (jpeg):** Decimal number (with a dot or comma as decimal separator) between 0 and 1 that affects the jpeg quality and thus indirectly the file size. The default is 0.90. Entering a percent number (e.g. 90%) is also possible.

#### Background Image

If the "Background Image" option has been enabled, you can select an image file - again, either by drag-and-drop it or using the file selection dialogue.

After an image is loaded, it is displayed in a small preview with key details. You can then select the following parameters:

**Image Transformation**: If the uploaded background image does not exactly match the dimensions of the poster to be generated, the image will be resized.

If you select “<u>no transform</u>,” the background image will be used without any resizing. If its width and height are greater than or equal to those of the poster, the image will simply be positioned. Otherwise, the image will be repeated in a tiled pattern.

If “<u>fill</u>” is selected, the background image will be resized to match the poster’s width and height. This may result in significant distortion.

If “<u>proportional</u>” is selected, the background image will be scaled while maintaining its aspect ratio so that it covers the width and height of the poster; if necessary, it will also be repositioned.

**Positioning**: An anchor point identified by two letters, the first indicating the horizontal position (L: left, C: center, R: right), and the second indicating the vertical position (T: top, M: middle, B: bottom). For example, with the “RT” positioning, the upper-right corner of the background image is aligned with the upper-right corner of the poster.

**Opacity**: Controls how much of the poster's background color shows through. At 0, the background image is invisible and only the background color appears; at 1, only the background image is visible.

There is no provision for deleting the background image, as the background image feature can be disabled using the corresponding toggle.

#### Image Captions

The following options are available for adding image captions to each individual image on the poster:

- Image captions from the image files' metadata
- Manually entered image captions
- Using the file name as the image caption

When image files are loaded, the metadata is analyzed to determine whether an image caption is present. The IPTC fields “Object Name,” “Headline,” “Caption,” and “Caption/Abstract” are analyzed, as well as the EXIF field “ImageDescription.” If an image caption is found, it is displayed in the list at the bottom of the page. The field in this list is editable, so image captions can be changed or added manually. If image captions are missing, the file name can also be used as an alternative.

If the “Image captions” option has been enabled, the following parameters can be configured:

**Font Family**: Select the font family for displaying image captions. Initially, a small number of standard fonts are available here, which should always be accessible.

If the browser and operating system support this feature, a button will appear to the right that displays “Default fonts” when the program starts. Clicking this button displays all fonts installed on the device. You may need to approve a browser permission request to do this. Afterward, all system fonts will be available, as indicated on the button. Clicking the button again will return you to the default fonts.

**Font size**: Font size in pixels.

**Color**: Color selection for the font.

**Stroke color**: Color selection for the font outline (output format Canvas) or shadow (output format HTML) effects to improve readability.

**Stroke width**: Width of the font outline (output format Canvas) or the shadow (output format HTML) offset in pixels.

**Use filename as caption**: If activated, the filename will be used as caption, if no caption provided.

**Image anchor**: A reference point on the image for positioning the image caption. Specified using two letters for horizontal (L: left, C: center, R: right) and vertical (T: top, M: middle, B: bottom) alignment.

**Text anchor**: Reference point within the text for positioning the image caption. Specified using two letters for horizontal (L: left, C: center, R: right) and vertical (T: top, M: middle, B: bottom) alignment.

**Offsets**: Position of the text anchor point relative to the image anchor point, specified as two numbers for the horizontal and vertical distances in pixels, separated by a space or comma.
*Example*: Image anchor = “CB”, Text anchor = ‘CT’, Offsets = “5, 20” causes the text to be positioned so that the top-center point of the text box is 5 pixels to the right and 20 pixels below the bottom-center point of the image.

**Text Angle**: The angle of the text alignment in degrees.

### 5. Generate Poster

#### 5.1. Show Poster

The poster is created using the ***Show Poster*** button . This takes place in a separate window, which is either newly created or reused on subsequent calls. Since the window is reused, you should close it if the external dimensions of the poster change. Otherwise you have to adjust it to the correct size manually.

The display in the window is primarily used to check the result so that program options, parameters or image sequences can be changed if necessary. The displayed state is also the basis for the subsequent ***Save Poster*** function .

In **HTML** output format , this window also has the following additional functions:

**Magnification:** Clicking on a single image will enlarge it. You can also navigate through the series of images using the right arrow, left arrow, page up, page down, home and end keys or by clicking on the corresponding buttons. This gives you a small picture gallery.

**Save as HTML:** Using the key combination **Ctrl+s**, the poster can be saved as an HTML file with the functionality described above. The resulting .html file contains all images in full resolution, so the storage space required for this file is many times greater than the corresponding jpeg file. The .html file can be used locally and displayed in the browser or made available on a web space on the Internet. This function should not be confused with the Save Poster function described below.

#### 5.2. Save Poster

The ***Save Poster*** button can be used to save the poster as a jpeg file. The poster name is suggested as the file name, but can be overwritten by entering something else.

This button is only available if a poster has been generated and displayed. The system always displays the last state shown using ***Show Poster***, even if the poster window has been closed in the meantime. Any parameter changes made afterward do not take effect until the ***Show Poster*** function has been selected.

