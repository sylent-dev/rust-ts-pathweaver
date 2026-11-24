# Opening builds: the tests (4e, 4f)

The home page of the first visit opens builds three ways: files dropped anywhere on the page, files chosen with a click on the zone, and the JSON of a build pasted in the zone become a field; when nothing opens, the zone says why. These tests check what only a real browser shows: the files of the desktop, the clipboard, the page lit under files. Since 4f1, a build opened shows its page: its header and its five tabs, their panels still empty; since 4f2, the band of the open builds over it, a tab per build and +, which chooses more. Run the tests in a row. A ✅ is enough when it works; detail only what goes wrong.

## Before

1. In the folder of the project, on the branch of the step: `cd web && npm run dev`, then open the address it prints.
2. Run every test in Firefox, then the tests 1, 4, 8, 10, 11 and 12 again in a Chromium (Chrome, Edge, Brave).
3. Reload the page (F5) before each test: until the library (step 8), a reload closes the builds open and gives the first visit back.
4. The files of `inputs/builds/`: `ggg-titan-warrior-sample.build`, `pob-twobyul-deadeye.build`, `utkarshbehre-spark-comet.build`; any image of the desktop, named `passive-tree.png` here; and a file `broken.build` made in a text editor, of these three lines:

   ```
   {
     "name": "Broken",,
   }
   ```

5. Seven files that aren't builds (images, texts), one of them renamed with a name of more than 80 characters.

## The tests

1. **Several files dropped**: select the three `.build` files in the file manager and drop them together anywhere on the page, outside the zone.
   ✅ The first visit gives way to a build at once, without a button: one of the three (the last in the order the system gives them, « Titan Warrior », « TwobyulDeadeye » or « Spark - Comet »), its header: its name, its portrait on the left, and under it « by Grinding Gear Games · Titan Warrior », « Deadeye Ranger » alone for TwobyulDeadeye, which names no author, or « by UtkarshBehre · Stormweaver Sorceress »; under the header the five tabs, **Overview** in white over its bar.

2. **A build and an image dropped together**: drop `ggg-titan-warrior-sample.build` and `passive-tree.png` together.
   ✅ « Titan Warrior » shows, and under it, in a line of its own, « passive-tree.png isn't a text file », without a period.

3. **Choose files**: click the zone, choose `utkarshbehre-spark-comet.build` in the dialog of the system, open it.
   ✅ The dialog lets several files be chosen; « Spark - Comet » shows at once.

4. **Files over the page**: drag `passive-tree.png` over the page without letting go, move it around, then take it out of the window and let go there.
   ✅ While it is over the page, the whole grid lights up in blue around the pointer, the zone grows a little with its three notes, lit, its corners closing in on the +, and says « Let go to open it » over « 1 file over the page ». Out of the window, the page is as before, nothing lit.

5. **An image alone**: drop `passive-tree.png` alone.
   ✅ Nothing opens; the zone stays, without its icon, a thin red line around it, and says « That isn't a .build file » over « passive-tree.png isn't a text file », the name white and the reason red, « Drop a .build file here, or click to choose it » at its foot. A click anywhere in the zone, its words included, opens the dialog of the system.

6. **A broken .build**: drop `broken.build`.
   ✅ « That build can't be read » over « broken.build isn't valid JSON at line 2 », without the text of the line.

7. **Two, then seven files refused**: drop `passive-tree.png` and `broken.build` together; then drop the seven files that aren't builds together, the one of the long name first.
   ✅ « These files can't be read », then a line each: the two files, each name white and its reason red. For the seven: the first three lines, then « and 4 more » in grey, no list that scrolls; the long name is cut by « … » at the edge of the zone, its line on one line.

8. **A paste from poe.ninja**: on poe.ninja, open a build of Path of Exile 2 and copy its JSON with the button of the page that copies it; on Pathweaver, click **Paste JSON** under the zone, then press Ctrl+V.
   ✅ After the click, the zone becomes a black field in its place, a thin blue line around it, the caret in it, « Paste the JSON of a build » over « Ctrl+V: it opens at once · Esc: back to the files », and the link under it says **Drop a file instead**. After Ctrl+V, the build opens at once, without a button, its name that of poe.ninja; the browser asks no permission.

9. **Back to the files**: click **Paste JSON**, then press Esc; click **Paste JSON** again, then **Drop a file instead**.
   ✅ Each time, the zone comes back as at first, « Add your first build », and the link says **Paste JSON** again. After Esc, the keyboard is on **Paste JSON**: Enter turns the zone into the field again.

10. **A text refused**: copy the three lines of `broken.build`, click **Paste JSON** and paste them; then drop `passive-tree.png` on the field.
    ✅ The text stays in the field, in grey, a thin red line around it, and « This text isn't valid JSON at line 2 » in red at its foot, under the text. The image dropped gives the zone back, which says « That isn't a .build file » (test 5).

11. **+ in the band**: drop `ggg-titan-warrior-sample.build`; click the white **+** at the end of the band over its header, choose `pob-twobyul-deadeye.build` and `utkarshbehre-spark-comet.build` together in the dialog of the system, open them; then click **+** again and choose `pob-twobyul-deadeye.build` alone.
    ✅ The dialog opens at once and lets several files be chosen; the page stays, with three tabs side by side, the last of the two chosen shown: its tab in white, its portrait the only one in colour, the two others grey and dimmed. Chosen again, « TwobyulDeadeye » isn't added a fourth time: its tab is shown.

12. **Six builds in a narrow window**: make the window of the browser 900 pixels wide (half of a screen of 1,920); drop together the first six `.build` files of `inputs/builds/` in the order of the file manager. Click **+2 ▾**, then a build of its menu; then make the window wider, as wide as the screen, then 900 pixels again.
    ✅ Four tabs, the build shown in the last of them, then **+2 ▾** in blue, then **+**. The click opens a menu under the band, which grows out of **+2 ▾** and settles; the two builds without a tab are listed, each its portrait in colour, its name over its ascendancy. The build clicked shows at once, its tab in the place of the last one, whose build goes into the menu; the menu is closed. Made wider, the band gives each build a tab and **+2 ▾** leaves; at 900 pixels again, the build shown keeps its tab. Esc, a click outside the menu, or files dropped while it is open close it.

13. **Your own scenarios**: whatever else you want to try.

## Results

| Test | Result | Remark |
|---|---|---|
| 1. Several files dropped | | |
| 2. A build and an image dropped together | | |
| 3. Choose files | | |
| 4. Files over the page | | |
| 5. An image alone | | |
| 6. A broken .build | | |
| 7. Two, then seven files refused | | |
| 8. A paste from poe.ninja | | |
| 9. Back to the files | | |
| 10. A text refused | | |
| 11. + in the band | | |
| 12. Six builds in a narrow window | | |
| 13. Your own scenarios | | |
