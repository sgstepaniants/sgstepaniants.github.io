# Curriculum vitae

The generated LaTeX source and the PDF used by the website live together in this directory. Academic content comes from `../content/academic-profile.yaml`; do not edit text between the `GENERATED` markers in the `.tex` file.

From the repository root, run `npm run update` to regenerate the website and resume and compile with XeLaTeX. All auxiliary files are written to the ignored `.build/` directory; only `George_Stepaniants_CV.pdf` is copied back beside the source. Run `npm run clean` to remove the build directory.
