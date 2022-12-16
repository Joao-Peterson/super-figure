;; https://stackoverflow.com/a/5846727
;; gimp -n -i -b

;; adapted no loop
(let* ( (filename "test.xcf") (image 0) (layer 0) )
	(set! image (car (gimp-file-load RUN-NONINTERACTIVE filename filename)))
	(set! layer (car (gimp-image-merge-visible-layers image CLIP-TO-IMAGE)))
	(set! filename (string-append (substring filename 0 (- (string-length filename) 4)) ".png"))
	(gimp-file-save RUN-NONINTERACTIVE image layer filename filename)
	(gimp-image-delete image)
	(gimp-quit 0)
)

;; vars
(let* ( (filename "${file}") (fileout "${dir}/${basename}.png") (image 0) (layer 0) )
	(set! image (car (gimp-file-load RUN-NONINTERACTIVE filename filename)))
	(set! layer (car (gimp-image-merge-visible-layers image CLIP-TO-IMAGE)))
	(gimp-file-save RUN-NONINTERACTIVE image layer fileout fileout)
	(gimp-image-delete image)
	(gimp-quit 0)
)

;; one liner
${executable} -n -i -b (let* ( (filename "${file}") (fileout "${dir}/${basename}.png") (image 0) (layer 0) ) (set! image (car (gimp-file-load RUN-NONINTERACTIVE filename filename))) (set! layer (car (gimp-image-merge-visible-layers image CLIP-TO-IMAGE))) (gimp-file-save RUN-NONINTERACTIVE image layer fileout fileout) (gimp-image-delete image) (gimp-quit 0))

;; string
"${executable} -n -i -b '(let* ( (filename \"${file}\") (fileout \"${dir}/${basename}.png\") (image 0) (layer 0) ) (set! image (car (gimp-file-load RUN-NONINTERACTIVE filename filename))) (set! layer (car (gimp-image-merge-visible-layers image CLIP-TO-IMAGE))) (gimp-file-save RUN-NONINTERACTIVE image layer fileout fileout) (gimp-image-delete image) (gimp-quit 0))'"