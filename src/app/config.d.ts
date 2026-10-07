export interface AppConfig {
    llm:               Llm;
    howtos:            Directory;
    directory:         Directory;
    components:        Components;
    tasks:             Tasks;
    site:              Site;
    footer_left:       FooterLeft[];
    footer_right:      any[];
    settings:          Settings;
    params:            Params;
    navigation:        Navigation;
    navigation_button: NavigationButton;
    ecommerce:         Ecommerce;
    metadata:          Metadata;
    shopify:           Shopify;
    pages:             Pages;
    core:              Core;
    dev:               Dev;
    i18n:              I18N;
    products:          Components;
    retail:            Retail;
    rss:               Rss;
    osrl:              Osrl;
    features:          { [key: string]: boolean };
    defaults:          Defaults;
    cad:               Cad;
    assets:            Assets;
    optimization:      Optimization;
}

export interface Assets {
    local:      boolean;
    glob:       string;
    cad_url:    string;
    url:        string;
    item_url_r: string;
    item_url:   string;
}

export interface Cad {
    cache:                 boolean;
    export_configurations: boolean;
    export_sub_components: boolean;
    renderer:              string;
    renderer_view:         string;
    renderer_quality:      number;
    extensions:            string[];
    model_ext:             string;
    default_configuration: string;
    main_match:            string;
    cam_main_match:        string;
}

export interface Components {
    root:             string;
    glob:             string;
    enabled:          string;
    howto_migration?: string;
}

export interface Core {
    logging_namespace: string;
    translate_content: boolean;
    languages:         string[];
    languages_prod:    string[];
    rtl_languages:     string[];
    osr_root:          string;
}

export interface Defaults {
    image_url: string;
    license:   string;
    contact:   string;
}

export interface Dev {
    file_server: string;
}

export interface Directory {
    glob:               string;
    files_base?:        string;
    edit_root:          string;
    filter_llm:         boolean;
    annotations:        boolean;
    annotations_cache:  boolean;
    complete_resources: boolean;
    add_hardware:       boolean;
    add_resources:      boolean;
    add_references:     boolean;
    complete_skills:    boolean;
    local_resources:    boolean;
    seo_llm:            boolean;
    max_items:          number;
    migration?:         string;
    root_intern:        string;
    root:               string;
    files_web?:         string;
    llm_keywords?:      boolean;
}

export interface Ecommerce {
    brand:          string;
    currencySymbol: string;
    currencyCode:   string;
}

export interface FooterLeft {
    href: string;
    text: string;
}

export interface I18N {
    store:           string;
    cache:           boolean;
    source_language: string;
    asset_path:      string;
}

export interface Llm {
    cache:     boolean;
    cache_dir: string;
}

export interface Metadata {
    country:     string;
    city:        string;
    author:      string;
    author_bio:  string;
    author_url:  string;
    image:       string;
    description: string;
    keywords:    string;
}

export interface Navigation {
    top: FooterLeft[];
}

export interface NavigationButton {
    enable: boolean;
    label:  string;
    link:   string;
}

export interface Optimization {
    image_settings: ImageSettings;
    presets:        Presets;
}

export interface ImageSettings {
    gallery:  Gallery;
    lightbox: Gallery;
}

export interface Gallery {
    show_title:       boolean;
    show_description: boolean;
    sizes_thumb:      string;
    sizes_large:      string;
    sizes_regular:    string;
}

export interface Presets {
    slow:   Fast;
    medium: Fast;
    fast:   Fast;
}

export interface Fast {
    sizes_medium: string;
    sizes_thumbs: string;
    sizes_large:  string;
}

export interface Osrl {
    env:             string;
    env_dev:         string;
    module_name:     string;
    lang_flavor:     string;
    product_profile: string;
}

export interface Pages {
    home: Home;
}

export interface Home {
    hero:  string;
    _blog: Blog;
}

export interface Blog {
    store: string;
}

export interface Params {
    contact_form_action: string;
    copyright:           string;
}

export interface Retail {
    library_branch:                string;
    projects_branch:               string;
    compile_cache:                 boolean;
    media_cache:                   boolean;
    log_level_i18n_product_assets: string;
    convert_product_media:         boolean;
    translate_product_assets:      boolean;
    populate_product_defaults:     boolean;
}

export interface Rss {
    title:       string;
    description: string;
}

export interface Settings {
    search:         boolean;
    account:        boolean;
    sticky_header:  boolean;
    theme_switcher: boolean;
    default_theme:  string;
}

export interface Shopify {
    currencySymbol: string;
    currencyCode:   string;
    collections:    Collections;
}

export interface Collections {
    hero_slider:       string;
    featured_products: string;
}

export interface Site {
    title:          string;
    base_url:       string;
    description:    string;
    base_path:      string;
    trailing_slash: boolean;
    favicon:        string;
    logo:           string;
    logo_darkmode:  string;
    logo_width:     string;
    logo_height:    string;
    logo_text:      string;
    image:          Image;
}

export interface Image {
    default: string;
    error:   string;
    alt:     string;
}

export interface Tasks {
    config_log_directory:  string;
    log_directory:         string;
    compile_content:       boolean;
    compile_content_cache: boolean;
}
