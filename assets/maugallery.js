(function ($) {
  $.fn.mauGallery = function (options) {
    var settings = $.extend($.fn.mauGallery.defaults, options);
    console.log("Options après fusion:", settings);

    var tagsCollection = [];

    return this.each(function () {
      var $gallery = $(this);
      console.log("Initialisation de la galerie pour:", $gallery);

      // Création de la ligne de la galerie
      $.fn.mauGallery.methods.createRowWrapper($gallery);

      // Création de la lightbox si activée
      if (settings.lightBox) {
        console.log("Création de la lightbox avec l'id:", settings.lightboxId);
        $.fn.mauGallery.methods.createLightBox(
          $gallery,
          settings.lightboxId,
          settings.navigation
        );
      }

      // Ajout des écouteurs d'événements
      $.fn.mauGallery.listeners(settings);

      // Traitement de chaque élément de la galerie
      var $items = $gallery.children(".gallery-item");
      var $fragment = $(document.createDocumentFragment());

      $items.each(function () {
        var $item = $(this);
        console.log("Traitement de l'élément de la galerie:", $item);

        $.fn.mauGallery.methods.responsiveImageItem($item);
        $.fn.mauGallery.methods.wrapItemInColumn($item, settings.columns);
        $fragment.append($item); // Utilisation de fragment pour minimiser les manipulations DOM

        var theTag = $item.data("gallery-tag");
        if (settings.showTags && theTag && !tagsCollection.includes(theTag)) {
          tagsCollection.push(theTag);
          console.log("Tag ajouté à la collection:", theTag);
        }
      });

      $.fn.mauGallery.methods.moveItemsInRowWrapper($fragment, $gallery);

      // Affichage des tags si activé
      if (settings.showTags) {
        console.log("Affichage des tags avec position:", settings.tagsPosition);
        $.fn.mauGallery.methods.showItemTags(
          $gallery,
          settings.tagsPosition,
          tagsCollection
        );
      }

      // Affichage de la galerie avec une animation
      $gallery.fadeIn(500);
      console.log("Galerie affichée avec fadeIn.");
    });
  };

  // Paramètres par défaut
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };

  // Écouteurs d'événements
  $.fn.mauGallery.listeners = function (options) {
    console.log("Ajout des écouteurs d'événements.");

    $(".gallery").on("click", ".gallery-item", function () {
      if (options.lightBox && $(this).is("img")) {
        console.log("Ouverture de la lightbox pour l'image:", $(this).attr("src"));
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    $(".gallery").on("click", ".mg-prev", function () {
      $.fn.mauGallery.methods.changeImage('prev', options.lightboxId);
    });

    $(".gallery").on("click", ".mg-next", function () {
      $.fn.mauGallery.methods.changeImage('next', options.lightboxId);
    });
  };

  // Méthodes du plugin
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      console.log("Vérification et création de la ligne wrapper pour:", element);
      if (!element.children().first().hasClass("row")) {
        element.append('<div class="gallery-items-row row"></div>');
        console.log("Ligne wrapper créée.");
      }
    },

    wrapItemInColumn(element, columns) {
      console.log("Emballage de l'élément dans une colonne avec colonnes:", columns);
      var columnClasses = "";
      if (typeof columns === "number") {
        columnClasses = `col-${Math.ceil(12 / columns)}`;
      } else if (typeof columns === "object") {
        for (var breakpoint in columns) {
          columnClasses += ` col-${breakpoint}-${Math.ceil(12 / columns[breakpoint])}`;
        }
      } else {
        console.error(`Les colonnes doivent être définies comme des nombres ou des objets. ${typeof columns} n'est pas pris en charge.`);
      }
      element.wrap(`<div class='item-column mb-4 ${columnClasses}'></div>`);
    },

    moveItemsInRowWrapper(fragment, gallery) {
      console.log("Déplacement des éléments dans la ligne wrapper");
      gallery.find(".gallery-items-row").append(fragment);
    },

    openLightBox(element, lightboxId) {
      console.log("Ouverture de la lightbox avec id:", lightboxId, "pour l'image:", element.attr("src"));
      $(`#${lightboxId}`).find(".lightboxImage").attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    changeImage(direction, lightboxId) {
      console.log(`Affichage de l'image ${direction === 'prev' ? 'précédente' : 'suivante'} dans la lightbox avec id:`, lightboxId);

      // Récupérer le tag actif
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");

      // Obtenir la collection d'images selon le tag actif
      let imagesCollection = $.fn.mauGallery.methods.getImagesCollection(activeTag);

      // Obtenir l'URL de l'image active
      let activeImageSrc = $(".lightboxImage").attr("src");

      // Trouver l'index de l'image active dans la collection
      let activeIndex = imagesCollection.findIndex(
        (img) => img.attr("src") === activeImageSrc
      );

      // Calculer l'index de la nouvelle image en fonction de la direction
      let newIndex;
      if (direction === 'prev') {
        newIndex = (activeIndex - 1 + imagesCollection.length) % imagesCollection.length;
      } else if (direction === 'next') {
        newIndex = (activeIndex + 1) % imagesCollection.length;
      } else {
        console.error("Direction inconnue:", direction);
        return;
      }

      // Sélectionner la nouvelle image
      let newImage = imagesCollection[newIndex];

      // Mettre à jour la source de l'image dans la lightbox
      $(".lightboxImage").attr("src", newImage.attr("src"));
    },

    getImagesCollection(activeTag) {
      console.log("Récupération des images pour le tag:", activeTag);

      let imagesCollection = [];

      $(".item-column img").each(function () {
        let $img = $(this);
        if (activeTag === "all" || $img.data("gallery-tag") === activeTag) {
          imagesCollection.push($img);
        }
      });

      return imagesCollection;
    },

    createLightBox(gallery, lightboxId, navigation) {
      console.log("Création de la lightbox pour la galerie:", gallery, "avec id:", lightboxId);
      gallery.append(`
        <div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${navigation ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' : '<span style="display:none;" />'}
                <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clic"/>
                ${navigation ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>' : '<span style="display:none;" />'}
              </div>
            </div>
          </div>
        </div>
      `);
      console.log("Lightbox ajoutée au DOM.");
    },

    showItemTags(gallery, position, tags) {
      console.log("Affichage des tags avec position:", position, "et tags:", tags);

      var $fragment = $(document.createDocumentFragment());
      var $allTagItem = $('<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>');
      $fragment.append($allTagItem);

      tags.forEach(function (tag) {
        var $tagItem = $(`<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`);
        $fragment.append($tagItem);
      });

      var $tagsList = $('<ul class="tags-bar nav nav-pills"></ul>').append($fragment);

      if (position === "top") {
        gallery.prepend($tagsList);
      } else if (position === "bottom") {
        gallery.append($tagsList);
      }

      console.log("Tags affichés:", $tagsList);
    },

    filterByTag() {
      console.log("Filtrage des éléments par tag:", $(this).data("images-toggle"));

      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        var $parent = $(this).parent();
        if ($(this).data("gallery-tag") === tag || tag === "all") {
          $parent.show(300);
        } else {
          $parent.hide(300);
        }
      });
    },

    responsiveImageItem(element) {
      console.log("Rendre l'élément de la galerie réactif:", element);
      element.addClass("img-fluid");
    },
  };
})(jQuery);
