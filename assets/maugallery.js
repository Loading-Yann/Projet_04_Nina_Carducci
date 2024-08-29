(function ($) {
  $.fn.mauGallery = function (options) {
      // Initialisation des options avec les paramètres par défaut
      var settings = $.extend($.fn.mauGallery.defaults, options);
      console.log('Options après fusion:', settings);

      var tagsCollection = [];

      return this.each(function () {
          var $gallery = $(this);
          console.log('Initialisation de la galerie pour:', $gallery);

          // Création de la ligne de la galerie
          $.fn.mauGallery.methods.createRowWrapper($gallery);

          // Création de la lightbox si activée
          if (settings.lightBox) {
              console.log('Création de la lightbox avec l\'id:', settings.lightboxId);
              $.fn.mauGallery.methods.createLightBox(
                  $gallery,
                  settings.lightboxId,
                  settings.navigation
              );
          }

          // Ajout des écouteurs d'événements
          $.fn.mauGallery.listeners(settings);

          // Traitement de chaque élément de la galerie
          $gallery.children(".gallery-item").each(function (index) {
              var $item = $(this);
              console.log('Traitement de l\'élément de la galerie:', $item);

              $.fn.mauGallery.methods.responsiveImageItem($item);
              $.fn.mauGallery.methods.moveItemInRowWrapper($item);
              $.fn.mauGallery.methods.wrapItemInColumn($item, settings.columns);

              var theTag = $item.data("gallery-tag");
              if (settings.showTags && theTag !== undefined && tagsCollection.indexOf(theTag) === -1) {
                  tagsCollection.push(theTag);
                  console.log('Tag ajouté à la collection:', theTag);
              }
          });

          // Affichage des tags si activé
          if (settings.showTags) {
              console.log('Affichage des tags avec position:', settings.tagsPosition);
              $.fn.mauGallery.methods.showItemTags(
                  $gallery,
                  settings.tagsPosition,
                  tagsCollection
              );
          }

          // Affichage de la galerie avec une animation
          $gallery.fadeIn(500);
          console.log('Galerie affichée avec fadeIn.');
      });
  };

  // Paramètres par défaut
  $.fn.mauGallery.defaults = {
      columns: 3,
      lightBox: true,
      lightboxId: null,
      showTags: true,
      tagsPosition: "bottom",
      navigation: true
  };

  // Écouteurs d'événements
  $.fn.mauGallery.listeners = function (options) {
      console.log('Ajout des écouteurs d\'événements.');

      $(".gallery-item").on("click", function () {
          if (options.lightBox && $(this).prop("tagName") === "IMG") {
              console.log('Ouverture de la lightbox pour l\'image:', $(this).attr("src"));
              $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
          }
      });

      $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
      $(".gallery").on("click", ".mg-prev", () =>
          $.fn.mauGallery.methods.prevImage(options.lightboxId)
      );
      $(".gallery").on("click", ".mg-next", () =>
          $.fn.mauGallery.methods.nextImage(options.lightboxId)
      );
  };

  // Méthodes du plugin
  $.fn.mauGallery.methods = {
      createRowWrapper(element) {
          console.log('Vérification et création de la ligne wrapper pour:', element);
          if (!element.children().first().hasClass("row")) {
              element.append('<div class="gallery-items-row row"></div>');
              console.log('Ligne wrapper créée.');
          }
      },
      wrapItemInColumn(element, columns) {
          console.log('Emballage de l\'élément dans une colonne avec colonnes:', columns);
          if (columns.constructor === Number) {
              element.wrap(
                  `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
              );
          } else if (columns.constructor === Object) {
              var columnClasses = "";
              if (columns.xs) {
                  columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
              }
              if (columns.sm) {
                  columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
              }
              if (columns.md) {
                  columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
              }
              if (columns.lg) {
                  columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
              }
              if (columns.xl) {
                  columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
              }
              element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
          } else {
              console.error(
                  `Les colonnes doivent être définies comme des nombres ou des objets. ${typeof columns} n'est pas pris en charge.`
              );
          }
      },
      moveItemInRowWrapper(element) {
        console.log('Déplacement de l\'élément dans la ligne wrapper:', element);
    
        var rowWrapper = document.querySelector(".gallery-items-row");
        var fragment = document.createDocumentFragment();
        fragment.appendChild(element[0]); // Ajout de l'élément au fragment
    
        rowWrapper.appendChild(fragment); // Ajout du fragment au DOM en une seule opération
    }
    ,
      openLightBox(element, lightboxId) {
          console.log('Ouverture de la lightbox avec id:', lightboxId, 'pour l\'image:', element.attr("src"));
          $(`#${lightboxId}`)
              .find(".lightboxImage")
              .attr("src", element.attr("src"));
          $(`#${lightboxId}`).modal("toggle");
      },
      prevImage(lightboxId) {
          console.log('Affichage de l\'image précédente dans la lightbox avec id:', lightboxId);
          let activeImage = null;
          $("img.gallery-item").each(function () {
              if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
                  activeImage = $(this);
              }
          });
          let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
          let imagesCollection = [];
          if (activeTag === "all") {
              $(".item-column").each(function () {
                  if ($(this).children("img").length) {
                      imagesCollection.push($(this).children("img"));
                  }
              });
          } else {
              $(".item-column").each(function () {
                  if ($(this).children("img").data("gallery-tag") === activeTag) {
                      imagesCollection.push($(this).children("img"));
                  }
              });
          }
          let index = 0,
              next = null;

          $(imagesCollection).each(function (i) {
              if ($(activeImage).attr("src") === $(this).attr("src")) {
                  index = i;
              }
          });
          next =
              imagesCollection[index] ||
              imagesCollection[imagesCollection.length - 1];
          $(".lightboxImage").attr("src", $(next).attr("src"));
      },
      nextImage(lightboxId) {
          console.log('Affichage de l\'image suivante dans la lightbox avec id:', lightboxId);
          let activeImage = null;
          $("img.gallery-item").each(function () {
              if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
                  activeImage = $(this);
              }
          });
          let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
          let imagesCollection = [];
          if (activeTag === "all") {
              $(".item-column").each(function () {
                  if ($(this).children("img").length) {
                      imagesCollection.push($(this).children("img"));
                  }
              });
          } else {
              $(".item-column").each(function () {
                  if ($(this).children("img").data("gallery-tag") === activeTag) {
                      imagesCollection.push($(this).children("img"));
                  }
              });
          }
          let index = 0,
              next = null;

          $(imagesCollection).each(function (i) {
              if ($(activeImage).attr("src") === $(this).attr("src")) {
                  index = i;
              }
          });
          next = imagesCollection[index] || imagesCollection[0];
          $(".lightboxImage").attr("src", $(next).attr("src"));
      },
      createLightBox(gallery, lightboxId, navigation) {
          console.log('Création de la lightbox pour la galerie:', gallery, 'avec id:', lightboxId);
          gallery.append(`<div class="modal fade" id="${
              lightboxId ? lightboxId : "galleryLightbox"
          }" tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-body">
                          ${
                              navigation
                                  ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                  : '<span style="display:none;" />'
                          }
                          <img class="lightboxImage img-fluid" alt="Contenu de l\'image affichée dans la modale au clic"/>
                          ${
                              navigation
                                  ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                  : '<span style="display:none;" />'
                          }
                      </div>
                  </div>
              </div>
          </div>`);
          console.log('Lightbox ajoutée au DOM.');
      },
      showItemTags(gallery, position, tags) {
        console.log('Affichage des tags avec position:', position, 'et tags:', tags);
    
        // Seul l'élément "Tous" est actif par défaut
        var fragment = document.createDocumentFragment(); // Création d'un DocumentFragment
        var allTagItem = document.createElement('li');
        allTagItem.className = 'nav-item';
        allTagItem.innerHTML = '<span class="nav-link active active-tag" data-images-toggle="all">Tous</span>';
        fragment.appendChild(allTagItem);
    
        // Ajout des autres tags au fragment
        $.each(tags, function(index, value) {
            var tagItem = document.createElement('li');
            tagItem.className = 'nav-item';
            tagItem.innerHTML = `<span class="nav-link" data-images-toggle="${value}">${value}</span>`;
            fragment.appendChild(tagItem);
        });
    
        var tagsRow = document.createElement('ul');
        tagsRow.className = 'my-4 tags-bar nav nav-pills';
        tagsRow.appendChild(fragment); // Ajout du fragment au conteneur de tags
    
        if (position === "bottom") {
            gallery.append(tagsRow); // Ajout au DOM en une seule opération
        } else if (position === "top") {
            gallery.prepend(tagsRow); // Ajout au DOM en une seule opération
        } else {
            console.error(`Position des tags inconnue : ${position}`);
        }
    },    
    
    filterByTag() {
      var tag = $(this).data("images-toggle");
      console.log('Filtrage par tag pour:', tag);
      
      // Vérifie si l'élément cliqué possède déjà la classe active
      if ($(this).hasClass("active-tag")) {
          console.log('Cet élément est déjà actif. Aucun changement.');
          return;
      }
  
      // Avant de retirer les classes, afficher les classes de tous les boutons
      $(".nav-link").each(function(index, element) {
          console.log('Avant retrait - Bouton:', $(element).text(), 'Classes:', $(element).attr('class'));
      });
  
      // Retirer la classe active de tous les éléments
      $(".nav-link").removeClass("active active-tag");
      
      // Affiche les classes après suppression
      $(".nav-link").each(function(index, element) {
          console.log('Après retrait - Bouton:', $(element).text(), 'Classes:', $(element).attr('class'));
      });
  
      // Ajouter la classe active à l'élément cliqué
      $(this).addClass("active active-tag");
      console.log('Après ajout - Bouton actif:', $(this).text(), 'Classes:', $(this).attr('class'));
  
      // Filtrage des images
      $(".gallery-item").each(function() {
          $(this).parents(".item-column").hide();
          if (tag === "all") {
              $(this).parents(".item-column").show(300);
          } else if ($(this).data("gallery-tag") === tag) {
              $(this).parents(".item-column").show(300);
          }
      });
  }
  
  }    
})(jQuery);
