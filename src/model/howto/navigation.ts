import { IHowto, group_by_cat } from "@/model/howto/howto.js";

export interface CategoryNavigationItem {
    label: string;
    href?: string;
    isCurrent: boolean;
    collapsed?: boolean;
    isSubGroup?: boolean;
    items?: CategoryNavigationItem[];
}

export interface NavigationSection {
    label: string;
    collapsed: boolean;
    items: CategoryNavigationItem[];
}

export function getHowtoNavigation(
    allHowtos: { data: { item: IHowto } }[],
    currentSlug: string | undefined,
    currentCategory: string | undefined, // For category pages where there is no specific item
    locale: string
): NavigationSection[] {
    const allHowtoItems = allHowtos.map(
        (storeItem) => storeItem.data.item
    ) as IHowto[];

    const howtosByCategory = group_by_cat(allHowtoItems);
    const categories = Object.keys(howtosByCategory).sort();

    // Create organized page-level navigation for categories
    const organizedCategories: NavigationSection[] = [];

    // Separate and organize categories
    const uncategorizedItems =
        howtosByCategory["Uncategorized"] || howtosByCategory["uncategorized"] || [];

    const categorizedItems = categories
        .filter(
            (cat) => cat.toLowerCase() !== "uncategorized" && cat !== "Uncategorized",
        )
        .sort();

    // Determine active category: either from the current item or explicitly passed
    const activeCategoryLabel = currentCategory
        ? categorizedItems.find(c => c.toLowerCase() === currentCategory.toLowerCase())
        : (allHowtoItems.find(h => h.slug === currentSlug)?.category?.label);

    // Create dynamic category structure from actual data
    if (categorizedItems.length > 0) {
        organizedCategories.push({
            label: "Browse by Category",
            collapsed: false,
            items: categorizedItems.map((category) => ({
                label: `${category} (${howtosByCategory[category].length})`,
                isCurrent: false, // This is a group header, not a link usually, but structure requires it
                collapsed: !(category === activeCategoryLabel), // Expand current category
                isSubGroup: true, // This makes it a collapsible subgroup
                items: howtosByCategory[category]
                    .slice(0, 8)
                    .map((categoryHowto: IHowto) => ({
                        label: categoryHowto.title,
                        href: `/${locale}/howtos/${categoryHowto.slug}`,
                        isCurrent: categoryHowto.slug === currentSlug,
                    }))
                    .concat(
                        howtosByCategory[category].length > 8
                            ? [
                                {
                                    label: `View all ${howtosByCategory[category].length}...`,
                                    href: `/${locale}/howto-category/${category.toLowerCase().replace(/\s+/g, "-")}`,
                                    isCurrent: false,
                                },
                            ]
                            : [],
                    ),
            })),
        });
    }

    // Then, add uncategorized items if they exist
    if (uncategorizedItems.length > 0) {
        organizedCategories.push({
            label: `Uncategorized (${uncategorizedItems.length})`,
            collapsed: true,
            items: uncategorizedItems
                .slice(0, 10)
                .map((uncatHowto: IHowto) => ({
                    label: uncatHowto.title,
                    href: `/${locale}/howtos/${uncatHowto.slug}`,
                    isCurrent: uncatHowto.slug === currentSlug,
                }))
                .concat(
                    uncategorizedItems.length > 10
                        ? [
                            {
                                label: `View all ${uncategorizedItems.length} guides...`,
                                href: `/${locale}/howtos/uncategorized`,
                                isCurrent: false,
                            },
                        ]
                        : [],
                ),
        });
    }

    // Add quick navigation
    organizedCategories.unshift({
        label: "Quick Navigation",
        collapsed: false,
        items: [
            {
                label: "All Guides",
                href: `/${locale}/howtos`,
                isCurrent: false,
            },
            {
                label: "Recently Added",
                href: `/${locale}/howtos/recent`,
                isCurrent: false,
            },
        ],
    });

    return organizedCategories;
}
