"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  Sprout,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Search,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  Award,
  Leaf,
  Tractor,
  Wheat,
  Apple,
  Carrot,
  Egg,
  Milk,
  Star,
  ChevronRight,
} from "lucide-react"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useDebounce } from "@/hooks/use-debounce"
import { showToast } from "@/lib/utils"

interface RegionalAdaptationProps {
  currentLanguage: string
  userRegion: string
  onRegionChange: (region: string) => void
}

interface RegionData {
  name: string
  flag: string
  climate: string
  mainCrops: string[]
  livestock: string[]
  challenges: string[]
  opportunities: string[]
  languages: string[]
  currency: string
  cities: string[]
  population?: number
  gdpAgriculture?: number
  area?: number
  capital?: string
  season?: string
  tempMin?: number
  tempMax?: number
  rainfall?: number
}

// --- Base de données complète des pays ---
// Pour les pays non listés en détail, on utilise des valeurs par défaut
const getDefaultRegionData = (name: string, flag: string): RegionData => ({
  name,
  flag,
  climate: "Tempéré",
  mainCrops: ["Céréales", "Légumes", "Fruits"],
  livestock: ["Bovins", "Ovins", "Caprins"],
  challenges: ["Changement climatique", "Accès aux marchés"],
  opportunities: ["Agriculture durable", "Innovation technologique"],
  languages: ["Langue officielle"],
  currency: "Devise locale",
  cities: ["Capitale"],
  population: undefined,
  gdpAgriculture: undefined,
  area: undefined,
  capital: "Capitale",
  season: "Quatre saisons",
  tempMin: 10,
  tempMax: 25,
  rainfall: 800,
})

// Liste étendue des pays (plus de 190)
const allCountries: { name: string; code: string; flag: string; continent: string }[] = [
  { name: "Afghanistan", code: "AF", flag: "🇦🇫", continent: "Asie" },
  { name: "Afrique du Sud", code: "ZA", flag: "🇿🇦", continent: "Afrique" },
  { name: "Albanie", code: "AL", flag: "🇦🇱", continent: "Europe" },
  { name: "Algérie", code: "DZ", flag: "🇩🇿", continent: "Afrique" },
  { name: "Allemagne", code: "DE", flag: "🇩🇪", continent: "Europe" },
  { name: "Andorre", code: "AD", flag: "🇦🇩", continent: "Europe" },
  { name: "Angola", code: "AO", flag: "🇦🇴", continent: "Afrique" },
  { name: "Antigua-et-Barbuda", code: "AG", flag: "🇦🇬", continent: "Amériques" },
  { name: "Arabie saoudite", code: "SA", flag: "🇸🇦", continent: "Asie" },
  { name: "Argentine", code: "AR", flag: "🇦🇷", continent: "Amériques" },
  { name: "Arménie", code: "AM", flag: "🇦🇲", continent: "Asie" },
  { name: "Australie", code: "AU", flag: "🇦🇺", continent: "Océanie" },
  { name: "Autriche", code: "AT", flag: "🇦🇹", continent: "Europe" },
  { name: "Azerbaïdjan", code: "AZ", flag: "🇦🇿", continent: "Asie" },
  { name: "Bahamas", code: "BS", flag: "🇧🇸", continent: "Amériques" },
  { name: "Bahreïn", code: "BH", flag: "🇧🇭", continent: "Asie" },
  { name: "Bangladesh", code: "BD", flag: "🇧🇩", continent: "Asie" },
  { name: "Barbade", code: "BB", flag: "🇧🇧", continent: "Amériques" },
  { name: "Belgique", code: "BE", flag: "🇧🇪", continent: "Europe" },
  { name: "Belize", code: "BZ", flag: "🇧🇿", continent: "Amériques" },
  { name: "Bénin", code: "BJ", flag: "🇧🇯", continent: "Afrique" },
  { name: "Bhoutan", code: "BT", flag: "🇧🇹", continent: "Asie" },
  { name: "Biélorussie", code: "BY", flag: "🇧🇾", continent: "Europe" },
  { name: "Birmanie", code: "MM", flag: "🇲🇲", continent: "Asie" },
  { name: "Bolivie", code: "BO", flag: "🇧🇴", continent: "Amériques" },
  { name: "Bosnie-Herzégovine", code: "BA", flag: "🇧🇦", continent: "Europe" },
  { name: "Botswana", code: "BW", flag: "🇧🇼", continent: "Afrique" },
  { name: "Brésil", code: "BR", flag: "🇧🇷", continent: "Amériques" },
  { name: "Brunei", code: "BN", flag: "🇧🇳", continent: "Asie" },
  { name: "Bulgarie", code: "BG", flag: "🇧🇬", continent: "Europe" },
  { name: "Burkina Faso", code: "BF", flag: "🇧🇫", continent: "Afrique" },
  { name: "Burundi", code: "BI", flag: "🇧🇮", continent: "Afrique" },
  { name: "Cambodge", code: "KH", flag: "🇰🇭", continent: "Asie" },
  { name: "Cameroun", code: "CM", flag: "🇨🇲", continent: "Afrique" },
  { name: "Canada", code: "CA", flag: "🇨🇦", continent: "Amériques" },
  { name: "Cap-Vert", code: "CV", flag: "🇨🇻", continent: "Afrique" },
  { name: "Centrafrique", code: "CF", flag: "🇨🇫", continent: "Afrique" },
  { name: "Chili", code: "CL", flag: "🇨🇱", continent: "Amériques" },
  { name: "Chine", code: "CN", flag: "🇨🇳", continent: "Asie" },
  { name: "Chypre", code: "CY", flag: "🇨🇾", continent: "Europe" },
  { name: "Colombie", code: "CO", flag: "🇨🇴", continent: "Amériques" },
  { name: "Comores", code: "KM", flag: "🇰🇲", continent: "Afrique" },
  { name: "Congo", code: "CG", flag: "🇨🇬", continent: "Afrique" },
  { name: "Congo (RDC)", code: "CD", flag: "🇨🇩", continent: "Afrique" },
  { name: "Corée du Nord", code: "KP", flag: "🇰🇵", continent: "Asie" },
  { name: "Corée du Sud", code: "KR", flag: "🇰🇷", continent: "Asie" },
  { name: "Costa Rica", code: "CR", flag: "🇨🇷", continent: "Amériques" },
  { name: "Côte d'Ivoire", code: "CI", flag: "🇨🇮", continent: "Afrique" },
  { name: "Croatie", code: "HR", flag: "🇭🇷", continent: "Europe" },
  { name: "Cuba", code: "CU", flag: "🇨🇺", continent: "Amériques" },
  { name: "Danemark", code: "DK", flag: "🇩🇰", continent: "Europe" },
  { name: "Djibouti", code: "DJ", flag: "🇩🇯", continent: "Afrique" },
  { name: "Dominique", code: "DM", flag: "🇩🇲", continent: "Amériques" },
  { name: "Égypte", code: "EG", flag: "🇪🇬", continent: "Afrique" },
  { name: "Émirats arabes unis", code: "AE", flag: "🇦🇪", continent: "Asie" },
  { name: "Équateur", code: "EC", flag: "🇪🇨", continent: "Amériques" },
  { name: "Érythrée", code: "ER", flag: "🇪🇷", continent: "Afrique" },
  { name: "Espagne", code: "ES", flag: "🇪🇸", continent: "Europe" },
  { name: "Estonie", code: "EE", flag: "🇪🇪", continent: "Europe" },
  { name: "Eswatini", code: "SZ", flag: "🇸🇿", continent: "Afrique" },
  { name: "États-Unis", code: "US", flag: "🇺🇸", continent: "Amériques" },
  { name: "Éthiopie", code: "ET", flag: "🇪🇹", continent: "Afrique" },
  { name: "Fidji", code: "FJ", flag: "🇫🇯", continent: "Océanie" },
  { name: "Finlande", code: "FI", flag: "🇫🇮", continent: "Europe" },
  { name: "France", code: "FR", flag: "🇫🇷", continent: "Europe" },
  { name: "Gabon", code: "GA", flag: "🇬🇦", continent: "Afrique" },
  { name: "Gambie", code: "GM", flag: "🇬🇲", continent: "Afrique" },
  { name: "Géorgie", code: "GE", flag: "🇬🇪", continent: "Asie" },
  { name: "Ghana", code: "GH", flag: "🇬🇭", continent: "Afrique" },
  { name: "Grèce", code: "GR", flag: "🇬🇷", continent: "Europe" },
  { name: "Grenade", code: "GD", flag: "🇬🇩", continent: "Amériques" },
  { name: "Guatemala", code: "GT", flag: "🇬🇹", continent: "Amériques" },
  { name: "Guinée", code: "GN", flag: "🇬🇳", continent: "Afrique" },
  { name: "Guinée-Bissau", code: "GW", flag: "🇬🇼", continent: "Afrique" },
  { name: "Guinée équatoriale", code: "GQ", flag: "🇬🇶", continent: "Afrique" },
  { name: "Guyana", code: "GY", flag: "🇬🇾", continent: "Amériques" },
  { name: "Haïti", code: "HT", flag: "🇭🇹", continent: "Amériques" },
  { name: "Honduras", code: "HN", flag: "🇭🇳", continent: "Amériques" },
  { name: "Hongrie", code: "HU", flag: "🇭🇺", continent: "Europe" },
  { name: "Inde", code: "IN", flag: "🇮🇳", continent: "Asie" },
  { name: "Indonésie", code: "ID", flag: "🇮🇩", continent: "Asie" },
  { name: "Irak", code: "IQ", flag: "🇮🇶", continent: "Asie" },
  { name: "Iran", code: "IR", flag: "🇮🇷", continent: "Asie" },
  { name: "Irlande", code: "IE", flag: "🇮🇪", continent: "Europe" },
  { name: "Islande", code: "IS", flag: "🇮🇸", continent: "Europe" },
  { name: "Israël", code: "IL", flag: "🇮🇱", continent: "Asie" },
  { name: "Italie", code: "IT", flag: "🇮🇹", continent: "Europe" },
  { name: "Jamaïque", code: "JM", flag: "🇯🇲", continent: "Amériques" },
  { name: "Japon", code: "JP", flag: "🇯🇵", continent: "Asie" },
  { name: "Jordanie", code: "JO", flag: "🇯🇴", continent: "Asie" },
  { name: "Kazakhstan", code: "KZ", flag: "🇰🇿", continent: "Asie" },
  { name: "Kenya", code: "KE", flag: "🇰🇪", continent: "Afrique" },
  { name: "Kirghizistan", code: "KG", flag: "🇰🇬", continent: "Asie" },
  { name: "Kiribati", code: "KI", flag: "🇰🇮", continent: "Océanie" },
  { name: "Koweït", code: "KW", flag: "🇰🇼", continent: "Asie" },
  { name: "Laos", code: "LA", flag: "🇱🇦", continent: "Asie" },
  { name: "Lesotho", code: "LS", flag: "🇱🇸", continent: "Afrique" },
  { name: "Lettonie", code: "LV", flag: "🇱🇻", continent: "Europe" },
  { name: "Liban", code: "LB", flag: "🇱🇧", continent: "Asie" },
  { name: "Libéria", code: "LR", flag: "🇱🇷", continent: "Afrique" },
  { name: "Libye", code: "LY", flag: "🇱🇾", continent: "Afrique" },
  { name: "Liechtenstein", code: "LI", flag: "🇱🇮", continent: "Europe" },
  { name: "Lituanie", code: "LT", flag: "🇱🇹", continent: "Europe" },
  { name: "Luxembourg", code: "LU", flag: "🇱🇺", continent: "Europe" },
  { name: "Macédoine du Nord", code: "MK", flag: "🇲🇰", continent: "Europe" },
  { name: "Madagascar", code: "MG", flag: "🇲🇬", continent: "Afrique" },
  { name: "Malaisie", code: "MY", flag: "🇲🇾", continent: "Asie" },
  { name: "Malawi", code: "MW", flag: "🇲🇼", continent: "Afrique" },
  { name: "Maldives", code: "MV", flag: "🇲🇻", continent: "Asie" },
  { name: "Mali", code: "ML", flag: "🇲🇱", continent: "Afrique" },
  { name: "Malte", code: "MT", flag: "🇲🇹", continent: "Europe" },
  { name: "Maroc", code: "MA", flag: "🇲🇦", continent: "Afrique" },
  { name: "Marshall", code: "MH", flag: "🇲🇭", continent: "Océanie" },
  { name: "Maurice", code: "MU", flag: "🇲🇺", continent: "Afrique" },
  { name: "Mauritanie", code: "MR", flag: "🇲🇷", continent: "Afrique" },
  { name: "Mexique", code: "MX", flag: "🇲🇽", continent: "Amériques" },
  { name: "Micronésie", code: "FM", flag: "🇫🇲", continent: "Océanie" },
  { name: "Moldavie", code: "MD", flag: "🇲🇩", continent: "Europe" },
  { name: "Monaco", code: "MC", flag: "🇲🇨", continent: "Europe" },
  { name: "Mongolie", code: "MN", flag: "🇲🇳", continent: "Asie" },
  { name: "Monténégro", code: "ME", flag: "🇲🇪", continent: "Europe" },
  { name: "Mozambique", code: "MZ", flag: "🇲🇿", continent: "Afrique" },
  { name: "Namibie", code: "NA", flag: "🇳🇦", continent: "Afrique" },
  { name: "Nauru", code: "NR", flag: "🇳🇷", continent: "Océanie" },
  { name: "Népal", code: "NP", flag: "🇳🇵", continent: "Asie" },
  { name: "Nicaragua", code: "NI", flag: "🇳🇮", continent: "Amériques" },
  { name: "Niger", code: "NE", flag: "🇳🇪", continent: "Afrique" },
  { name: "Nigeria", code: "NG", flag: "🇳🇬", continent: "Afrique" },
  { name: "Norvège", code: "NO", flag: "🇳🇴", continent: "Europe" },
  { name: "Nouvelle-Zélande", code: "NZ", flag: "🇳🇿", continent: "Océanie" },
  { name: "Oman", code: "OM", flag: "🇴🇲", continent: "Asie" },
  { name: "Ouganda", code: "UG", flag: "🇺🇬", continent: "Afrique" },
  { name: "Ouzbékistan", code: "UZ", flag: "🇺🇿", continent: "Asie" },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", continent: "Asie" },
  { name: "Palaos", code: "PW", flag: "🇵🇼", continent: "Océanie" },
  { name: "Panama", code: "PA", flag: "🇵🇦", continent: "Amériques" },
  { name: "Papouasie-Nouvelle-Guinée", code: "PG", flag: "🇵🇬", continent: "Océanie" },
  { name: "Paraguay", code: "PY", flag: "🇵🇾", continent: "Amériques" },
  { name: "Pays-Bas", code: "NL", flag: "🇳🇱", continent: "Europe" },
  { name: "Pérou", code: "PE", flag: "🇵🇪", continent: "Amériques" },
  { name: "Philippines", code: "PH", flag: "🇵🇭", continent: "Asie" },
  { name: "Pologne", code: "PL", flag: "🇵🇱", continent: "Europe" },
  { name: "Portugal", code: "PT", flag: "🇵🇹", continent: "Europe" },
  { name: "Qatar", code: "QA", flag: "🇶🇦", continent: "Asie" },
  { name: "Roumanie", code: "RO", flag: "🇷🇴", continent: "Europe" },
  { name: "Royaume-Uni", code: "GB", flag: "🇬🇧", continent: "Europe" },
  { name: "Russie", code: "RU", flag: "🇷🇺", continent: "Europe/Asie" },
  { name: "Rwanda", code: "RW", flag: "🇷🇼", continent: "Afrique" },
  { name: "Saint-Christophe-et-Niévès", code: "KN", flag: "🇰🇳", continent: "Amériques" },
  { name: "Sainte-Lucie", code: "LC", flag: "🇱🇨", continent: "Amériques" },
  { name: "Saint-Marin", code: "SM", flag: "🇸🇲", continent: "Europe" },
  { name: "Saint-Vincent-et-les-Grenadines", code: "VC", flag: "🇻🇨", continent: "Amériques" },
  { name: "Salomon", code: "SB", flag: "🇸🇧", continent: "Océanie" },
  { name: "Salvador", code: "SV", flag: "🇸🇻", continent: "Amériques" },
  { name: "Samoa", code: "WS", flag: "🇼🇸", continent: "Océanie" },
  { name: "Sao Tomé-et-Principe", code: "ST", flag: "🇸🇹", continent: "Afrique" },
  { name: "Sénégal", code: "SN", flag: "🇸🇳", continent: "Afrique" },
  { name: "Serbie", code: "RS", flag: "🇷🇸", continent: "Europe" },
  { name: "Seychelles", code: "SC", flag: "🇸🇨", continent: "Afrique" },
  { name: "Sierra Leone", code: "SL", flag: "🇸🇱", continent: "Afrique" },
  { name: "Singapour", code: "SG", flag: "🇸🇬", continent: "Asie" },
  { name: "Slovaquie", code: "SK", flag: "🇸🇰", continent: "Europe" },
  { name: "Slovénie", code: "SI", flag: "🇸🇮", continent: "Europe" },
  { name: "Somalie", code: "SO", flag: "🇸🇴", continent: "Afrique" },
  { name: "Soudan", code: "SD", flag: "🇸🇩", continent: "Afrique" },
  { name: "Soudan du Sud", code: "SS", flag: "🇸🇸", continent: "Afrique" },
  { name: "Sri Lanka", code: "LK", flag: "🇱🇰", continent: "Asie" },
  { name: "Suède", code: "SE", flag: "🇸🇪", continent: "Europe" },
  { name: "Suisse", code: "CH", flag: "🇨🇭", continent: "Europe" },
  { name: "Suriname", code: "SR", flag: "🇸🇷", continent: "Amériques" },
  { name: "Syrie", code: "SY", flag: "🇸🇾", continent: "Asie" },
  { name: "Tadjikistan", code: "TJ", flag: "🇹🇯", continent: "Asie" },
  { name: "Tanzanie", code: "TZ", flag: "🇹🇿", continent: "Afrique" },
  { name: "Tchad", code: "TD", flag: "🇹🇩", continent: "Afrique" },
  { name: "Tchéquie", code: "CZ", flag: "🇨🇿", continent: "Europe" },
  { name: "Thaïlande", code: "TH", flag: "🇹🇭", continent: "Asie" },
  { name: "Timor oriental", code: "TL", flag: "🇹🇱", continent: "Asie" },
  { name: "Togo", code: "TG", flag: "🇹🇬", continent: "Afrique" },
  { name: "Tonga", code: "TO", flag: "🇹🇴", continent: "Océanie" },
  { name: "Trinité-et-Tobago", code: "TT", flag: "🇹🇹", continent: "Amériques" },
  { name: "Tunisie", code: "TN", flag: "🇹🇳", continent: "Afrique" },
  { name: "Turkménistan", code: "TM", flag: "🇹🇲", continent: "Asie" },
  { name: "Turquie", code: "TR", flag: "🇹🇷", continent: "Asie/Europe" },
  { name: "Tuvalu", code: "TV", flag: "🇹🇻", continent: "Océanie" },
  { name: "Ukraine", code: "UA", flag: "🇺🇦", continent: "Europe" },
  { name: "Uruguay", code: "UY", flag: "🇺🇾", continent: "Amériques" },
  { name: "Vanuatu", code: "VU", flag: "🇻🇺", continent: "Océanie" },
  { name: "Vatican", code: "VA", flag: "🇻🇦", continent: "Europe" },
  { name: "Venezuela", code: "VE", flag: "🇻🇪", continent: "Amériques" },
  { name: "Vietnam", code: "VN", flag: "🇻🇳", continent: "Asie" },
  { name: "Yémen", code: "YE", flag: "🇾🇪", continent: "Asie" },
  { name: "Zambie", code: "ZM", flag: "🇿🇲", continent: "Afrique" },
  { name: "Zimbabwe", code: "ZW", flag: "🇿🇼", continent: "Afrique" },
]

// Données détaillées pour certains pays (vous pouvez en ajouter d'autres)
const detailedRegions: Record<string, RegionData> = {
  "Burkina Faso": {
    name: "Burkina Faso",
    flag: "🇧🇫",
    climate: "Sahélien",
    mainCrops: ["Mil", "Sorgho", "Maïs", "Arachide", "Coton"],
    livestock: ["Zébu", "Chèvres", "Moutons", "Volaille"],
    challenges: ["Sécheresse", "Désertification", "Accès à l'eau"],
    opportunities: ["Agriculture pluviale", "Élevage extensif", "Coopératives"],
    languages: ["Français", "Mooré", "Dioula"],
    currency: "CFA",
    cities: ["Ouagadougou", "Bobo-Dioulasso", "Koudougou"],
    population: 22673762,
    gdpAgriculture: 31.2,
    capital: "Ouagadougou",
    season: "Saison sèche",
    tempMin: 25,
    tempMax: 38,
    rainfall: 800,
  },
  "France": {
    name: "France",
    flag: "🇫🇷",
    climate: "Tempéré océanique",
    mainCrops: ["Blé", "Maïs", "Orge", "Betterave", "Vigne"],
    livestock: ["Bovins", "Porcins", "Ovins", "Volaille"],
    challenges: ["Concurrence internationale", "Dépendance aux intrants"],
    opportunities: ["Agriculture biologique", "Vin AOC", "Innovation"],
    languages: ["Français"],
    currency: "Euro",
    cities: ["Paris", "Lyon", "Marseille", "Bordeaux"],
    population: 67800000,
    gdpAgriculture: 1.7,
    capital: "Paris",
    season: "Quatre saisons",
    tempMin: 5,
    tempMax: 25,
    rainfall: 700,
  },
  "Sénégal": {
    name: "Sénégal",
    flag: "🇸🇳",
    climate: "Sahélien",
    mainCrops: ["Arachide", "Riz", "Mil", "Mangue"],
    livestock: ["Zébu", "Chèvres", "Moutons", "Volaille"],
    challenges: ["Salinisation", "Exode rural"],
    opportunities: ["Pêche", "Horticulture", "Tourisme rural"],
    languages: ["Français", "Wolof", "Peul"],
    currency: "CFA",
    cities: ["Dakar", "Thiès", "Kaolack", "Saint-Louis"],
    population: 17316449,
    gdpAgriculture: 16.9,
    capital: "Dakar",
    season: "Saison sèche",
    tempMin: 22,
    tempMax: 35,
    rainfall: 500,
  },
  "Mali": {
    name: "Mali",
    flag: "🇲🇱",
    climate: "Sahélien",
    mainCrops: ["Riz", "Mil", "Coton", "Arachide"],
    livestock: ["Zébu", "Chèvres", "Moutons", "Dromadaires"],
    challenges: ["Conflits", "Désertification"],
    opportunities: ["Irrigation", "Élevage transhumant"],
    languages: ["Français", "Bambara", "Peul"],
    currency: "CFA",
    cities: ["Bamako", "Sikasso", "Mopti", "Gao"],
    population: 21904983,
    gdpAgriculture: 38.5,
    capital: "Bamako",
    season: "Saison sèche",
    tempMin: 20,
    tempMax: 42,
    rainfall: 600,
  },
  "Niger": {
    name: "Niger",
    flag: "🇳🇪",
    climate: "Sahélien",
    mainCrops: ["Mil", "Niébé", "Oignon", "Moringa"],
    livestock: ["Zébu", "Chèvres", "Dromadaires"],
    challenges: ["Désertification", "Insécurité", "Pauvreté"],
    opportunities: ["Cultures irriguées", "Élevage nomade"],
    languages: ["Français", "Haoussa", "Zarma"],
    currency: "CFA",
    cities: ["Niamey", "Zinder", "Maradi", "Agadez"],
    population: 25130817,
    gdpAgriculture: 40.2,
    capital: "Niamey",
    season: "Saison sèche",
    tempMin: 28,
    tempMax: 45,
    rainfall: 200,
  },
  "Côte d'Ivoire": {
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    climate: "Tropical",
    mainCrops: ["Cacao", "Café", "Huile de palme", "Hévéa"],
    livestock: ["Zébu", "Chèvres", "Moutons", "Volaille"],
    challenges: ["Déforestation", "Prix des matières premières"],
    opportunities: ["Agro-industrie", "Exportation", "Bio"],
    languages: ["Français", "Dioula", "Baoulé"],
    currency: "CFA",
    cities: ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa"],
    population: 29389301,
    gdpAgriculture: 22.1,
    capital: "Yamoussoukro",
    season: "Saison des pluies",
    tempMin: 22,
    tempMax: 32,
    rainfall: 1500,
  },
  "Brésil": {
    name: "Brésil",
    flag: "🇧🇷",
    climate: "Tropical",
    mainCrops: ["Soja", "Maïs", "Café", "Canne à sucre", "Orange"],
    livestock: ["Bovins", "Porcins", "Volaille"],
    challenges: ["Déforestation", "Pression foncière"],
    opportunities: ["Agro-industrie", "Biocarburants", "Exportation"],
    languages: ["Portugais"],
    currency: "Real",
    cities: ["Brasilia", "São Paulo", "Rio de Janeiro", "Salvador"],
    population: 213000000,
    gdpAgriculture: 5.0,
    capital: "Brasilia",
    season: "Saisons inversées",
    tempMin: 18,
    tempMax: 32,
    rainfall: 1200,
  },
  "Inde": {
    name: "Inde",
    flag: "🇮🇳",
    climate: "Tropical/mousson",
    mainCrops: ["Riz", "Blé", "Coton", "Canne à sucre", "Épices"],
    livestock: ["Bovins", "Buffles", "Caprins"],
    challenges: ["Sous-alimentation", "Pression démographique"],
    opportunities: ["Irrigation", "Agriculture contractuelle"],
    languages: ["Hindi", "Anglais", "Tamoul", "Télougou"],
    currency: "Roupie",
    cities: ["New Delhi", "Mumbai", "Kolkata", "Chennai"],
    population: 1380000000,
    gdpAgriculture: 16.5,
    capital: "New Delhi",
    season: "Mousson",
    tempMin: 15,
    tempMax: 40,
    rainfall: 1100,
  },
  "Chine": {
    name: "Chine",
    flag: "🇨🇳",
    climate: "Divers",
    mainCrops: ["Riz", "Blé", "Maïs", "Pomme de terre", "Coton"],
    livestock: ["Porcins", "Volaille", "Bovins"],
    challenges: ["Pollution", "Urbanisation rapide"],
    opportunities: ["Technologie agricole", "Aquaculture"],
    languages: ["Mandarin"],
    currency: "Yuan",
    cities: ["Pékin", "Shanghai", "Canton", "Shenzhen"],
    population: 1410000000,
    gdpAgriculture: 7.5,
    capital: "Pékin",
    season: "Quatre saisons",
    tempMin: -5,
    tempMax: 30,
    rainfall: 600,
  },
  "États-Unis": {
    name: "États-Unis",
    flag: "🇺🇸",
    climate: "Tempéré",
    mainCrops: ["Maïs", "Soja", "Blé", "Coton", "Fruits"],
    livestock: ["Bovins", "Porcins", "Volaille"],
    challenges: ["Érosion des sols", "Concurrence"],
    opportunities: ["Biotechnologies", "Exportations massives"],
    languages: ["Anglais"],
    currency: "Dollar",
    cities: ["Washington", "New York", "Los Angeles", "Chicago"],
    population: 331000000,
    gdpAgriculture: 0.9,
    capital: "Washington D.C.",
    season: "Quatre saisons",
    tempMin: -10,
    tempMax: 35,
    rainfall: 700,
  },
}

// Fonction pour obtenir les données d'une région (avec fallback par défaut)
const getRegionData = (countryName: string): RegionData => {
  if (detailedRegions[countryName]) return detailedRegions[countryName]
  const country = allCountries.find(c => c.name === countryName)
  const flag = country?.flag || "🌍"
  return getDefaultRegionData(countryName, flag)
}

export default function RegionalAdaptation({ currentLanguage, userRegion, onRegionChange }: RegionalAdaptationProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [language, setLanguage] = useState(currentLanguage)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [regionWeather, setRegionWeather] = useState({ temp: 32, icon: "☀️", humidity: 45 })

  const isOnline = useOnlineStatus()
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [favoriteRegions, setFavoriteRegions] = useLocalStorage<string[]>("favoriteRegions", [])
  const [lastViewedRegion, setLastViewedRegion] = useLocalStorage("lastViewedRegion", userRegion)

  const t = {
    title: "Adaptation Régionale",
    subtitle: "Données agricoles pour tous les pays",
    online: "En ligne",
    offline: "Hors ligne",
    refresh: "Actualiser",
    climate: "Climat",
    population: "Population",
    area: "Superficie",
    capital: "Capitale",
    temperature: "Température",
    season: "Saison",
    rainfall: "Pluviométrie",
    gdpAgriculture: "PIB Agricole",
    overview: "Aperçu",
    agriculture: "Agriculture",
    challenges: "Défis",
    opportunities: "Opportunités",
    weather: "Météo",
    calendar: "Calendrier",
    mainCrops: "Cultures principales",
    livestock: "Élevage",
    cities: "Villes principales",
    languages: "Langues",
    currency: "Monnaie",
    searchPlaceholder: "Rechercher un pays...",
    favoriteRegions: "Pays favoris",
    noFavorites: "Aucun favori",
    addToFavorites: "Ajouter aux favoris",
    removeFromFavorites: "Retirer",
    loading: "Chargement...",
    drySeason: "Saison sèche",
    rainySeason: "Saison des pluies",
    recommendations: "Recommandations",
  }

  const currentRegionData = getRegionData(userRegion)

  // Météo simulée basée sur la région
  useEffect(() => {
    if (isOnline) {
      const temp = currentRegionData.tempMin ? (currentRegionData.tempMin + (currentRegionData.tempMax || 30)) / 2 : 25
      const icon = currentRegionData.season === "Saison des pluies" ? "🌧️" : "☀️"
      const humidity = currentRegionData.season === "Saison des pluies" ? 70 : 45
      setRegionWeather({ temp: Math.round(temp), icon, humidity })
    }
  }, [userRegion, isOnline, currentRegionData])

  useEffect(() => {
    setLanguage(currentLanguage)
    setLastViewedRegion(userRegion)
  }, [currentLanguage, userRegion, setLastViewedRegion])

  const handleAddToFavorites = (regionName: string) => {
    if (favoriteRegions.includes(regionName)) {
      setFavoriteRegions(favoriteRegions.filter(r => r !== regionName))
      showToast(`${regionName} retiré des favoris`, "info")
    } else {
      setFavoriteRegions([...favoriteRegions, regionName])
      showToast(`${regionName} ajouté aux favoris`, "success")
    }
  }

  const refreshData = useCallback(async () => {
    if (!isOnline) {
      showToast("Connexion internet requise", "error")
      return
    }
    setRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setRegionWeather(prev => ({ ...prev, temp: prev.temp + (Math.random() * 2 - 1) }))
      showToast("Données actualisées", "success")
    } catch {
      showToast("Erreur lors de l'actualisation", "error")
    } finally {
      setRefreshing(false)
    }
  }, [isOnline])

  // Filtrer les pays selon la recherche
  const filteredCountries = allCountries.filter(country =>
    country.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Barre de statut */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-bold">{t.title}</h2>
          {isOnline ? (
            <Badge variant="outline" className="text-green-600 border-green-200 gap-1">
              <Wifi className="h-3 w-3" /> {t.online}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-600 border-yellow-200 gap-1">
              <WifiOff className="h-3 w-3" /> {t.offline}
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={refreshData} disabled={refreshing} className="gap-1">
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {t.refresh}
        </Button>
      </div>

      {/* Sélecteur de pays */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="w-full sm:w-64 p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          value={userRegion}
          onChange={(e) => onRegionChange(e.target.value)}
        >
          {filteredCountries.map((country) => (
            <option key={country.code} value={country.name}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pays favoris */}
      {favoriteRegions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">{t.favoriteRegions}:</span>
          {favoriteRegions.map(region => (
            <button
              key={region}
              onClick={() => onRegionChange(region)}
              className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-0.5 transition-colors"
            >
              {allCountries.find(c => c.name === region)?.flag || "🌍"} {region}
            </button>
          ))}
        </div>
      )}

      {/* Vue d'ensemble du pays */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-700 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentRegionData.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold">{currentRegionData.name}</h2>
                  <button
                    onClick={() => handleAddToFavorites(currentRegionData.name)}
                    className="text-white/70 hover:text-yellow-400 transition-colors"
                  >
                    <Star className={`h-4 w-4 ${favoriteRegions.includes(currentRegionData.name) ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </button>
                </div>
                <p className="text-green-100 text-sm">{t.climate}: {currentRegionData.climate}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100">{t.population}</div>
              <div className="text-lg md:text-xl font-bold">{currentRegionData.population?.toLocaleString() || "N/A"}</div>
              <div className="text-xs text-green-100">{t.capital}: {currentRegionData.capital}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Thermometer className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg md:text-xl font-bold">{regionWeather.temp}°C</div>
              <div className="text-xs text-green-100">{t.temperature}</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Droplets className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg md:text-xl font-bold">{regionWeather.humidity}%</div>
              <div className="text-xs text-green-100">Humidité</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Cloud className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg md:text-xl font-bold">{currentRegionData.rainfall}mm</div>
              <div className="text-xs text-green-100">{t.rainfall}</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
              <Leaf className="h-5 w-5 mx-auto mb-1" />
              <div className="text-lg md:text-xl font-bold">{currentRegionData.gdpAgriculture || "N/A"}%</div>
              <div className="text-xs text-green-100">{t.gdpAgriculture}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2"><Info className="h-4 w-4" /><span className="hidden sm:inline">{t.overview}</span></TabsTrigger>
          <TabsTrigger value="agriculture" className="gap-2"><Sprout className="h-4 w-4" /><span className="hidden sm:inline">{t.agriculture}</span></TabsTrigger>
          <TabsTrigger value="weather" className="gap-2"><Sun className="h-4 w-4" /><span className="hidden sm:inline">{t.weather}</span></TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2"><Calendar className="h-4 w-4" /><span className="hidden sm:inline">{t.calendar}</span></TabsTrigger>
        </TabsList>

        {/* Onglet Aperçu */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-600" />{t.cities}</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{currentRegionData.cities.map(city => (<Badge key={city} variant="secondary">{city}</Badge>))}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-green-600" />{t.languages}</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{currentRegionData.languages.map(lang => (<Badge key={lang} variant="outline">{lang}</Badge>))}</div><p className="mt-3 text-sm text-gray-600">💱 {t.currency}: {currentRegionData.currency}</p></CardContent>
            </Card>
          </div>

          {/* Défis et opportunités */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-600" />{t.challenges}</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{currentRegionData.challenges.map((challenge, i) => (<div key={i} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg"><AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" /><span className="text-sm">{challenge}</span></div>))}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" />{t.opportunities}</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">{currentRegionData.opportunities.map((opp, i) => (<div key={i} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"><CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /><span className="text-sm">{opp}</span></div>))}</div></CardContent>
            </Card>
          </div>

          {/* Recommandations génériques */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-blue-600" />{t.recommendations}</CardTitle></CardHeader>
            <CardContent><div className="space-y-2"><p className="text-sm text-blue-800">• Adaptez vos pratiques agricoles au climat local</p><p className="text-sm text-blue-800">• Utilisez des semences résistantes à la sécheresse si besoin</p><p className="text-sm text-blue-800">• Rejoignez des coopératives pour mutualiser les ressources</p></div></CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Agriculture */}
        <TabsContent value="agriculture" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sprout className="h-5 w-5 text-green-600" />{t.mainCrops}</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{currentRegionData.mainCrops.map(crop => (<Badge key={crop} className="bg-green-100 text-green-800">{crop}</Badge>))}</div></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" />{t.livestock}</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{currentRegionData.livestock.map(animal => (<Badge key={animal} variant="outline">{animal}</Badge>))}</div></CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Météo */}
        <TabsContent value="weather" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Sun className="h-5 w-5" />Informations climatiques</CardTitle></CardHeader>
            <CardContent><div className="grid grid-cols-2 gap-3"><div><p className="text-sm font-medium">Saison principale</p><p className="text-lg">{currentRegionData.season}</p></div><div><p className="text-sm font-medium">Température moyenne</p><p className="text-lg">{regionWeather.temp}°C</p></div><div><p className="text-sm font-medium">Précipitations annuelles</p><p className="text-lg">{currentRegionData.rainfall} mm</p></div><div><p className="text-sm font-medium">Humidité moyenne</p><p className="text-lg">{regionWeather.humidity}%</p></div></div></CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Calendrier */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5" />Calendrier agricole indicatif</CardTitle></CardHeader>
            <CardContent><div className="space-y-3"><div className="flex justify-between items-center p-2 border-b"><span>Préparation des sols</span><Badge>Mars - Avril</Badge></div><div className="flex justify-between items-center p-2 border-b"><span>Semis principales cultures</span><Badge>Mai - Juin</Badge></div><div className="flex justify-between items-center p-2 border-b"><span>Entretien / Fertilisation</span><Badge>Juillet - Août</Badge></div><div className="flex justify-between items-center p-2"><span>Récoltes</span><Badge>Septembre - Octobre</Badge></div></div></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}